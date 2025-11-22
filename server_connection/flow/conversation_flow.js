import { get_state,  get_employee, create_state} from "../APIs/api_client.js";
import { service_message } from "./service_message.js";

export async function handle_conversation({user_phone, message_text, client}) {
    const state = await get_state({user_phone});
    switch (state.step) {
        case -1:
            let message = `Hola! Bienvenido a ${client.business_name}\n`;
            const employees = await get_employee({id: client.id});

            if (employees.length > 1) {  //¿Multiple employees?
                message += `¿Quién deseas que te atienda?\n`;
                
                employees.forEach((employee, index) => {
                    message += `${index + 1}. ${employee.name}\n`;
                })
                create_state({user_phone: user_phone, step: 0, client_id: client.id});

            } else if (employees.length === 1) { //Only one employee
                message += `Serás atendido por ${employees[0].name}\n`;
                message = await service_message({message, employee_id: employees[0].id, client_id: client.id, user_phone});
            }

        return message;
    }
}