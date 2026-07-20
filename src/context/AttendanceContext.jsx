import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  loadFromStorage,
  saveStudents,
  saveAttendanceRecords,
  STORAGE_KEYS,
} from '../utils/storage';

/**
 * Global attendance + student registry state.
 * Persists to localStorage; swap storage calls for REST API (see comments below).
 */
const AttendanceContext = createContext(null);

export function AttendanceProvider({ children }) {
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const { students: s, attendanceRecords: a } = loadFromStorage();
    
    // Automatically migrate older student records that don't have a department field
    let migrated = false;
    const migratedStudents = s.map((student) => {
      if (!student.department) {
        migrated = true;
        return { ...student, department: 'Computer Science' };
      }
      return student;
    });

    setStudents(migratedStudents);
    setAttendanceRecords(a);
    if (migrated) {
      saveStudents(migratedStudents);
    }
    setHydrated(true);
  }, []);

  const persistStudents = useCallback((next) => {
    setStudents(next);
    saveStudents(next);
  }, []);

  const persistAttendance = useCallback((next) => {
    setAttendanceRecords(next);
    saveAttendanceRecords(next);
  }, []);

  /** Register or update a student with a face descriptor and department. */
  const registerStudent = useCallback(
    ({ studentId, name, department, faceDescriptor }) => {
      const id = String(studentId).trim();
      const displayName = String(name).trim();
      const deptName = String(department || 'Computer Science').trim();
      if (!id || !displayName || !faceDescriptor?.length) {
        return { ok: false, error: 'Invalid data' };
      }

      const next = students.filter((s) => s.studentId !== id);
      next.push({
        studentId: id,
        name: displayName,
        department: deptName,
        faceDescriptor,
        registeredAt: new Date().toISOString(),
      });
      persistStudents(next);
      return { ok: true };
    },
    [students, persistStudents]
  );

  /**
   * Mark attendance for a recognized student (once per calendar day per student).
   */
  const markAttendance = useCallback((studentId, studentName) => {
    const now = new Date();
    const dateKey = now.toISOString().slice(0, 10);
    const prev = loadFromStorage().attendanceRecords;

    if (prev.some((r) => r.studentId === studentId && r.date === dateKey)) {
      return { ok: true, duplicate: true, record: null };
    }

    // Lookup department from current students
    const student = loadFromStorage().students.find(s => s.studentId === studentId);
    const department = student ? (student.department || 'Computer Science') : 'Computer Science';

    const record = {
      id: `${studentId}-${now.getTime()}`,
      studentId,
      studentName,
      department,
      date: dateKey,
      timestamp: now.toISOString(),
    };
    const next = [record, ...prev];
    saveAttendanceRecords(next);
    setAttendanceRecords(next);
    return { ok: true, duplicate: false, record };
  }, []);

  const removeStudent = useCallback(
    (studentId) => {
      const next = students.filter((s) => s.studentId !== studentId);
      persistStudents(next);
      
      // Also remove student's attendance records to maintain consistency
      const nextAttendance = attendanceRecords.filter((r) => r.studentId !== studentId);
      persistAttendance(nextAttendance);
    },
    [students, attendanceRecords, persistStudents, persistAttendance]
  );

  const clearAllData = useCallback(() => {
    persistStudents([]);
    persistAttendance([]);
  }, [persistStudents, persistAttendance]);

  const value = useMemo(
    () => ({
      students,
      attendanceRecords,
      hydrated,
      registerStudent,
      markAttendance,
      removeStudent,
      clearAllData,
      setAttendanceRecords: persistAttendance,
    }),
    [
      students,
      attendanceRecords,
      hydrated,
      registerStudent,
      markAttendance,
      removeStudent,
      clearAllData,
      persistAttendance,
    ]
  );

  return (
    <AttendanceContext.Provider value={value}>{children}</AttendanceContext.Provider>
  );
}

export function useAttendance() {
  const ctx = useContext(AttendanceContext);
  if (!ctx) throw new Error('useAttendance must be used within AttendanceProvider');
  return ctx;
}

export { STORAGE_KEYS };

