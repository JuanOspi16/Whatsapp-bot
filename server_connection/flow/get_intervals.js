import { get_schedules, get_appointments } from "../APIs/api_client.js";

export async function get_intervals({today, date, total_minutes, weekday, id}){
    today = new Date()
    today.setMinutes(today.getMinutes() + 10);

    const schedule = await get_schedules({id: id, day: weekday});

}