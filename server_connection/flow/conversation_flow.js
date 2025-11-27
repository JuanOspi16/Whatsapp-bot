import { get_state,  get_employee, create_state, get_services, update_state} from "../APIs/api_client.js";
import { service_message } from "./service_message.js";

export async function handle_conversation({user_phone, message_text, client}) {
    const states = await get_state({user_phone});
    const state = states[0];
    let message = ``;
    switch (state.step) {
        case -1:
            message = `Hola! Bienvenido a ${client.business_name}\n`;
            const employees = await get_employee({id: client.id});
            const new_state = await create_state({user_phone: user_phone, step: 0, client_id: client.id});
            
            const state_id = parseInt(new_state[0].user_state_id);
            
            if (employees.length > 1) {  //¿Multiple employees?
                message += `¿Quién deseas que te atienda?\n`;
                
                employees.forEach((employee, index) => {
                    message += `${index + 1}. ${employee.name}\n`;
                })
                update_state({id: state_id, step: 0});

            } else if (employees.length === 1) { //Only one employee
                message += `Serás atendido por ${employees[0].name}\n`;
                message = await service_message({message, employee_id: employees[0].id, client_id: client.id, user_phone, state_id});
            }

            break;
            
        case 0:
            
            const employees_list = await get_employee({id: client.id});
            const emp_index = parseInt(message_text) - 1;
            if (emp_index >= 0 && emp_index < employees_list.length) {
                const selected_employee = employees_list[emp_index];
                message = `Has seleccionado a ${selected_employee.name}.\n`;
                message = await service_message({message, employee_id: selected_employee.id, client_id: client.id, user_phone, state_id});
            }else{
                message = `Por favor selecciona una opción válida.\n`;
            }

            break;
        
        case 1:
            const services = await get_services({client_id: client.id});
            const serv_index = parseInt(message_text) - 1;
            if (serv_index >= 0 && serv_index < services.length) {
                const selected_service = services[serv_index];
                message = `Has seleccionado el servicio: ${selected_service.name} por $${selected_service.price}.\n`;
                message += `Deseas agregar algo más?\n1. Sí\n2. No\n`;
                update_state({id: state.user_state_id, step: 2});
            }else{
                message = `Por favor selecciona una opción válida.\n`;
            }

            break;

        case 2:
            if (message_text === '1') {
                message = await service_message({message, employee_id: selected_employee.id, client_id: client.id, user_phone, state_id});
            }

            break;
    }
    return message;
}