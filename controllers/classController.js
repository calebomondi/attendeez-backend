import { supabase } from "../database/db.js";
import { todaysClasses, giveTags, currentDate } from "../utils/utils.js";

//controller functions
export const classStatus = async (req, res) => {
    try {
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
          )
        `)
      .order('day_id', { ascending: true });
  
      console.log(`server-data-TC: ${data}`);
  
      const filteredTable = todaysClasses(data);
  
      res.json(giveTags(filteredTable));
  
    } catch (error) {
      res.status(500).json({error: error.message});
      console.log(`server-error-TT: ${error}`);
    }
  }

export const timetable = async (req,res) => {
    try {
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
            )
          `)
          .order('day_id', { ascending: true });

        console.log(`server-data-TT: ${data}`);

        res.json(data);

    } catch (error) {
        res.status(500).json({error: error.message});
        console.log(`server-error-TT: ${error}`);
    }
}

export const endBeforeTime = async (req,res) => {
  const {unitId} = req.query

  try {
    const {data, error} = await supabase
    .from('classsessions')
    .select(`session_end`)
    .eq('unit_id',unitId)
    .eq('session_date', currentDate())

    if (error) throw error

    if(!data || data.length === 0 || data[0].end_time === null)
      return res.json({session_end:false});

    res.json(data[0])

  } catch (error) {
    res.status(500).json({error: error.message});
  }
}

export const checkSessionEnd = async (req,res) => {
  const {unitId} = req.query

  if (!unitId) {
    return res.status(400).json({ error: 'Unit ID is required' })
  }

  const _date = currentDate()
    
  try {
    const {data, error} = await supabase
    .from('classsessions')
    .select(`end_time`)
    .eq('unit_id',unitId)
    .eq('session_date', _date);

    if (error) throw error

    if(!data || data.length === 0 || data[0].end_time === null)
      return res.json({end_time:'',session_end:false, date:_date})

    res.json({end_time:data[0].end_time, session_end:true, date:_date})
  } catch (error) {
    res.status(500).json({error: error.message});
  }
}

export const sessionStarted = async (req,res) => {
  const {unitId} = req.query;

  try {
    const {data, error} = await supabase
    .from('classsessions')
    .select(`id,session_end`)
    .eq('unit_id',unitId)
    .eq('session_date', currentDate());

    if (error) throw error

    if(!data || data.length === 0)
      return res.json({"id":0,"session_end":false})

    res.json({"id":data[0].id,"session_end":data[0].session_end})

  } catch (error) {
    res.status(500).json({error: error.message});
  }
}

export const activeSession = async (req,res) => {
  const {unitId} = req.query;

  try {
    const {data, error} = await supabase
    .from('classsessions')
    .select(`session_end`)
    .eq('unit_id',unitId)
    .eq('session_date', currentDate());

    if (error) throw error

    res.json(data[0])

  } catch (error) {
    res.status(500).json({error: error.message});
  }
}