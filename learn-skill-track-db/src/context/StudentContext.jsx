import { createContext, useContext, useEffect, useState } from "react";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "./AuthContext";
import {
  schoolSubjects,
  collegeSubjects,
  SUBJECTS_VERSION,
} from "../data/defaultSubjects";

const StudentContext = createContext();

export const StudentProvider = ({ children }) => {
  const { authUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [studyLogs, setStudyLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= LOAD ON AUTH CHANGE ================= */
  useEffect(() => {
    if (!authUser) {
      setProfile(null);
      setSubjects([]);
      setTasks([]);
      setStudyLogs([]);
      setLoading(false);
      return;
    }

    const uid = authUser.uid;
    setLoading(true);

    // Real-time listener for profile
    const profileUnsub = onSnapshot(
      doc(db, "users", uid, "data", "profile"),
      (snap) => {
        if (snap.exists()) {
          setProfile(snap.data());
        }
      },
    );

    // Real-time listener for subjects
    const subjectsUnsub = onSnapshot(
      collection(db, "users", uid, "subjects"),
      async (snap) => {
        if (snap.empty) {
          // First login: seed default subjects
          const profileSnap = await getDoc(
            doc(db, "users", uid, "data", "profile"),
          );
          const profileData = profileSnap.exists() ? profileSnap.data() : null;
          const educationType = profileData?.educationType?.toLowerCase();
          const defaults =
            educationType === "school" ? schoolSubjects : collegeSubjects;

          await Promise.all(
            defaults.map((sub) =>
              setDoc(doc(db, "users", uid, "subjects", sub.id), sub),
            ),
          );
          setSubjects(defaults);
        } else {
          const loaded = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          setSubjects(loaded);
        }
        setLoading(false);
      },
    );

    // Real-time listener for tasks
    const tasksUnsub = onSnapshot(
      collection(db, "users", uid, "tasks"),
      (snap) => {
        const loaded = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setTasks(loaded);
      },
    );

    // Real-time listener for study logs
    const logsUnsub = onSnapshot(
      collection(db, "users", uid, "studyLogs"),
      (snap) => {
        const loaded = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setStudyLogs(loaded);
      },
    );

    return () => {
      profileUnsub();
      subjectsUnsub();
      tasksUnsub();
      logsUnsub();
    };
  }, [authUser]);

  /* ================= PROFILE ================= */
  const updateProfile = async (updatedProfile) => {
    if (!authUser) return;
    const uid = authUser.uid;
    await setDoc(doc(db, "users", uid, "data", "profile"), updatedProfile, {
      merge: true,
    });
    setProfile(updatedProfile);
  };

  /* ================= SUBJECTS ================= */
  const addSubject = async (subject) => {
    if (!authUser) return;
    const uid = authUser.uid;
    await setDoc(doc(db, "users", uid, "subjects", subject.id), subject);
  };

  const deleteSubject = async (id) => {
    if (!authUser) return;
    const uid = authUser.uid;
    await deleteDoc(doc(db, "users", uid, "subjects", id));
  };

  /* ================= TASKS ================= */
  const updateTasks = async (updatedTasks) => {
    if (!authUser) return;
    const uid = authUser.uid;
    // Store tasks as a single document for simplicity
    await setDoc(doc(db, "users", uid, "data", "tasks"), {
      list: updatedTasks,
    });
    setTasks(updatedTasks);
  };

  /* ================= STUDY LOGS ================= */
  const addStudyLog = async (log) => {
    if (!authUser) return;
    const uid = authUser.uid;
    const logId = `log_${Date.now()}`;
    await setDoc(doc(db, "users", uid, "studyLogs", logId), log);
  };

  /* ================= DAILY PROGRESS ================= */
  const getDailyProgress = async () => {
    if (!authUser) return {};
    const uid = authUser.uid;
    const today = new Date().toISOString().split("T")[0];
    const snap = await getDoc(doc(db, "users", uid, "dailyProgress", today));
    return snap.exists() ? snap.data().subjects || {} : {};
  };

  const saveDailyProgress = async (subjects) => {
    if (!authUser) return;
    const uid = authUser.uid;
    const today = new Date().toISOString().split("T")[0];
    await setDoc(doc(db, "users", uid, "dailyProgress", today), {
      date: today,
      subjects,
    });
    // Also save total to weekly history
    const total = Object.values(subjects).reduce(
      (sum, s) => sum + (s.studied || 0),
      0,
    );
    await setDoc(doc(db, "users", uid, "weeklyHistory", today), {
      totalMinutes: total,
    });
  };

  /* ================= WEEKLY HISTORY ================= */
  const getWeeklyHistory = async () => {
    if (!authUser) return {};
    const uid = authUser.uid;
    const snap = await getDocs(collection(db, "users", uid, "weeklyHistory"));
    const history = {};
    snap.forEach((d) => {
      history[d.id] = d.data().totalMinutes || 0;
    });
    return history;
  };

  return (
    <StudentContext.Provider
      value={{
        profile,
        subjects,
        tasks,
        studyLogs,
        loading,
        updateProfile,
        addSubject,
        deleteSubject,
        updateTasks,
        addStudyLog,
        getDailyProgress,
        saveDailyProgress,
        getWeeklyHistory,
      }}
    >
      {children}
    </StudentContext.Provider>
  );
};

export const useStudent = () => useContext(StudentContext);
