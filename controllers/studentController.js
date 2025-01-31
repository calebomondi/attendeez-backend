import { supabase } from "../database/db.js";
import { currentDate, getCurrentTime, getSessionId } from "../utils/utils.js";

export const attendedToday = async (req,res) => {
    try {
      const user = req.query.user;
  
      const today = currentDate();
  
      const {data} = await supabase
      .from('classsessions')
      .select(`
        attendance!inner (
          attended
        ),
        unit_id
      `)
      .eq('attendance.student_id', `${user}`)
      .eq('session_date', `${today}`);
  
      console.log(`session-data-AT: ${data}`)
  
      res.json(data);
    } catch (error) {
      res.status(500).json({error: error.message});
      console.log(`server-error-TT: ${error}`);
    }  
  }

export const studentInfo = async (req,res) => {
    const myEmail = req.query.email
  
    try {
      const { data, error } = await supabase
        .from('students')
        .select(`student_id, name, semester`)
        .eq('email', myEmail)
        .single();
  
      if (error) throw error;
      res.json(data);
      
    } catch(error) {
      res.status(500).json({error: error.message});
      console.log(`server-error-SI: ${error}`);
    }
  }

export const joinSession = async (req,res) => {
    const {unitId, studentId} = req.query;
  
    const sessionId = await getSessionId(unitId)
  
    try {
      const {data, error} = await supabase
      .from('amattending')
      .insert([
        { 
          class_session_id : sessionId, 
          student_id : studentId, 
          started: true
        }
      ])
      .select()
  
      if (error) {
        console.log(`join-session: ${error}`)
        throw error
      }
  
      res.json({ 
        success: true, 
        message: `You Have Joined The Class at ${getCurrentTime()}`,
        data: data
      })
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      })
    }
  }

export const inAttendance = async (req,res) => {
    const {unitId,studentId} = req.query
  
    const sessionId = await getSessionId(unitId)
    console.log(`sessionId -> ${sessionId}`)
  
    if(sessionId == 0)
      return res.json({started: false});
  
    try {
      const { data, error } = await supabase
        .from('amattending')
        .select(`started`)
        .eq('class_session_id', sessionId)
        .eq('student_id',studentId)
        .limit(1);
  
        if (error) {
          console.log('inAttendance error!');
          throw error
        }
  
      res.json(data[0] || {started: false});
  
    } catch(error) {
      res.status(500).json({error: error.message});
      console.log(`server-error-SI: ${error.message}`);
    }
  }

export const uploadMultiple = async (req,res) => {
    const unitId = req.query.unitId;
    const studentIds = req.query.students?.split(',') || [];
  
    const sessionId = await getSessionId(unitId)
  
    let upload = []
  
    try {
      for(const id of studentIds) {
        const {data, error} = await supabase
        .from('attendance')
        .insert([
          { 
            class_session_id : sessionId, 
            student_id : `SCT221-${id}`, 
            attended: true
          }
        ])
        .select()
  
        if (error) {
          console.log(`upload student ${id}: ${error}`)
          throw error
        }
  
        upload.push(data[0].attended)
      }
  
      res.json({upload})
  
    } catch (error) {
      res.status(500).json({error: error.message});
      console.log(`server-error-UM: ${error}`);
    }
  }

export const uploadSingle = async (req,res) => {
    const {unitId, studentId} = req.query;
  
    const sessionId = await getSessionId(unitId)
  
    try {
      const {data, error} = await supabase
      .from('attendance')
      .insert([
        { 
          class_session_id : sessionId, 
          student_id : studentId, 
          attended: true
        }
      ])
      .select()
  
      if (error) {
        console.log(`join-session: ${error}`)
        throw error
      }
  
      res.json({ 
        success: true, 
        message: `${studentId} Added To Attendance List!`,
      })
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      })
    }
  }

export const progress = async (req,res) => {
    const user = req.query.user
  
    try {
      const {data, error} = await supabase
      .rpc('get_student_attendance', { p_student_id: user });
  
      if (error) throw error
  
      console.log(`server-data-progress: ${data}`);
  
      res.json(data);
  
    } catch (error) {
      res.status(500).json({error: error.message});
      console.log(`server-error-progress: ${error}`);
    }
  }