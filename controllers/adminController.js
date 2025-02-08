import { supabase } from "../database/db.js";

export const uploadTeachers = async (req, res) => {
    try {
        const { data } = req.body;
        console.log('Received data:', JSON.stringify(data));

        res.status(200).json({ message: 'Upload successful', data });
    } catch (error) {
        console.error('Error in uploadTeachers:', error);
        res.status(500).json({ message: 'Upload failed', error: error.message });
    }
}

export const uploadStudents = async (req, res) => {
    const { data, semester } = req.body;

    try {
        const {error} = await supabase
        .from('students')
        .insert(data.map(row => ({
            ...row,
            semester
        })))

        if (error) throw error

        res.status(200).json({ message: 'Students upload successful'});
    } catch (error) {
        console.error('Error in uploadStudents:', error);
        res.status(500).json({ message: 'Students Upload failed', error: error.message });
    }
}

export const enroll = async (req, res) => {
    const { data, course } = req.body;

    try {
        const {error} = await supabase
        .from('enrollments')
        .insert(data.map(row => ({
            student_id: row.student_id,
            course_id: course
        })))

        if (error) throw error

        res.status(200).json({ message: 'Enrollment successful'});
    } catch (error) {
        console.error('Error during enrollment:', error);
        res.status(500).json({ message: 'Enrollment failed', error: error.message });
    }
}