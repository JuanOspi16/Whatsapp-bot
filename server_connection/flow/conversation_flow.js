import { get_state,  get_employee, create_state, get_services} from "../../db_connection/fun_clients.js";

export async function handle_conversation({user_phone, message_text, client}) {
    const state = await get_state({user_phone});

    switch (state.step) {
        case -1:
            const message = `Hola! Bienvenido a ${client.business_name}\n`;
            const employees = await get_employee({id: client.id});

            if (employees.length > 1) {  //¿Multiple employees?
                message += `¿Quién deseas que te atienda?\n`;
                
                employees.forEach((employee, index) => {
                    message += `${index + 1}. ${employee.name}\n`;
                })

                create_state({user_phone, step: 0, client_id: client.id});

            } else if (employees.length === 1) { //Only one employee
                message += `Serás atendido por ${employees[0].name}\n`;
                const services = await get_services({client_id: client.id});

                if(services.length > 1) { //Multiple services
                    const employee = employees[0].id;
                    message += `¿Qué servicio deseas?\n`;
                    services.forEach((service, index) => {
                        message += `${index + 1}. ${service.name}\n`;
                    })

                    create_state({user_phone, step: 1, employee, client_id: client.id});
                }
            }

        return message;
    }
}