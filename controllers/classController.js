import { supabase } from "../database/db.js";
import { todaysClasses, giveTags } from "../utils/utils.js";

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