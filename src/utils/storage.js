/** localStorage keys — change prefix if you namespace by environment. */
export const STORAGE_KEYS = {
  students: 'attendance_face_students_v1',
  attendance: 'attendance_face_records_v1',
};

function safeParse(json, fallback) {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

export function loadFromStorage() {
  if (typeof localStorage === 'undefined') {
    return { students: [], attendanceRecords: [] };
  }
  const students = safeParse(localStorage.getItem(STORAGE_KEYS.students), []);
  const attendanceRecords = safeParse(localStorage.getItem(STORAGE_KEYS.attendance), []);
  return {
    students: Array.isArray(students) ? students : [],
    attendanceRecords: Array.isArray(attendanceRecords) ? attendanceRecords : [],
  };
}

export function saveStudents(students) {
  localStorage.setItem(STORAGE_KEYS.students, JSON.stringify(students));
}

export function saveAttendanceRecords(records) {
  localStorage.setItem(STORAGE_KEYS.attendance, JSON.stringify(records));
}
