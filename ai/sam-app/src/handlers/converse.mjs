
import { converse } from '../../service/conversService.mjs';

export const converseHandler = async (event) => {

    if (event.httpMethod !== 'POST') throw new Error(`getMethod only accept GET method, you tried: ${event.httpMethod}`);

    try {
        const body = JSON.parse(event.body);
        const id = body.id;
        const message = body.message;
        const conversation = await converse(id, message);
        return {
            statusCode: 200,
            body: JSON.stringify(conversation),
        };
    } catch (err) {
        console.log(err);
        return {
            statusCode: 500,
            body: JSON.stringify(err),
        };
    }
};
