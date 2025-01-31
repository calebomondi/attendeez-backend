import { supabase } from "../database/db.js";
import { getSessionId, currentDate, getCurrentTime, todaysClasses, checkClassStatus, sortStudentsByAttendance } from "../utils/utils.js";

export const finishClassSession = async (req,res) => {
    const {unitId} = req.query;
  
    const sessionId = await getSessionId(unitId)
  
    try {
      const {data, error} = await supabase
      .from('classsessions')
      .update([
        {
          unit_id : unitId, 
          session_date : currentDate(), 
          session_end : true, 
          end_time : getCurrentTime()
        }
      ])
      .eq('id',sessionId)
      .select();
  
      if (error) throw error
  
      res.json({ 
        success: true,
        message: `Class Session Ended At ${getCurrentTime()}`,
        data: data
      })
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      })
    }
  }

export const getTeacherInfo = async (req,res) => {
    const myEmail = req.query.email
  
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select(`
          teacher_id,
          name,
          email,
          units (
            unit_id,
            semester
          )
        `)
        .eq('email', myEmail)
        .single();
  
      if (error) throw error;
  
      res.json(data);
      
    } catch(error) {
      res.status(500).json({error: error.message});
      console.log(`server-error-TI: ${error}`);
    }
  }

export const myclassesToday = async (req,res) => {
    try {
      const teacher_id = req.query.teacher_id
  
      const {data} = await supabase
      .from('timetable')
      .select(`
          timetable_id,
          start_time,
          end_time,
          classroom_id,
          days (
            day_id,
            day_name
          ),
          units (
            unit_id,
            unit_name
          ),
          teacher_id
        `)
      .order('day_id', { ascending: true });
  
      console.log(`server-data-mct: ${data}`);
  
      const filteredTable = todaysClasses(data);
  
      const my_classes_today = checkClassStatus(filteredTable,teacher_id)
  
      res.json(my_classes_today);
  
    } catch (error) {
      res.status(500).json({error: error.message});
      console.log(`server-error-TT: ${error}`);
    }
  }

export const attendanceStats = async (req,res) => {
    const unit_id = req.query.unit_id
    try {
      const { data, error } = await supabase
      .rpc('get_attendance_stats', { p_unit_id: unit_id })
  
      if(error) throw error
  
      console.log(`server-response-students: ${data}`)
  
      res.json(sortStudentsByAttendance(data))
  
    } catch(error) {
      res.status(500).json({error: error.message});
      console.log(`server-error-MCA: ${error}`);
    }
  }

export const attendanceSummary = async (req,res) => {
    const unit_id = req.query.unit_id
    try {
      const { data, error } = await supabase
      .rpc('get_attendance_summary', { unit_id_param: unit_id });
  
      if (error) throw error
  
      console.log(`server-response-summary: ${data}`)
  
      res.json(data)
  
    } catch(error) {
      res.status(500).json({error: error.message});
      console.log(`server-error-MCA: ${error}`);
    }
  }

export const confirmedToday = async (req,res) => {
    try {
      const unit_id = req.query.unit_id;
  
      const today = currentDate();
  
      const {data} = await supabase
      .from('classsessions')
      .select(`session_end`)
      .eq('unit_id', `${unit_id}`)
      .eq('session_date', `${today}`);
  
      console.log(`session-data-CT: ${data}`)
  
      res.json(data);
    } catch (error) {
      res.status(500).json({error: error.message});
      console.log(`server-error-CT: ${error}`);
    }  
  }

export const startClassSession = async (req,res) => {
    const {unitId} = req.query;
  
    try {
      const {data, error} = await supabase
      .from('classsessions')
      .insert([
        {
          unit_id : unitId, 
          session_date : currentDate(), 
          session_end : false, 
          end_time : null
        }
      ])
      .select()
  
      if (error) {
        console.log(`start-class: ${error}`)
        throw error
      }
  
      res.json({ 
        success: true, 
        message: `Class started successfully at ${getCurrentTime()}`,
        data: data
      })
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      })
    }
  }