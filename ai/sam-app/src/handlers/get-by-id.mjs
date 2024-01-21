import { getById } from '../../service/conversService.mjs';

/**
 * A simple example includes a HTTP get method to get one item by id from a DynamoDB table.
 */
export const getByIdHandler = async (event) => {
  if (event.httpMethod !== 'GET') {
    throw new Error(`getMethod only accept GET method, you tried: ${event.httpMethod}`);
  }
  // All log statements are written to CloudWatch
  console.info('received:', event);

  const id = event.pathParameters.id;

  const conversation = await getById(id);

  const response = {
    statusCode: 200,
    body: conversation
  };

  console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
  return response;
}
