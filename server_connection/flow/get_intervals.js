import { get_schedules, get_appointments } from "../APIs/api_client.js";

export async function get_intervals({today, date, total_minutes, employee_id, id}){
    today = new Date();
    today.setMinutes(today.getMinutes() + 10);

    const schedule = await get_schedules({id: employee_id, day: today.getDay()});
    //console.log(schedule);
    //console.log(today, date);
    const appointments = await get_appointments({id: employee_id, today: today, day: date});
    //console.log(appointments);

}