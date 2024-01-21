// Create clients and set shared const values outside of the handler.

// Create a DocumentClient that represents the query to add an item
import { DynamoDBClient, CreateTableCommand, DeleteTableCommand, ScanCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';

const isLocal = !!process.env.AWS_SAM_LOCAL;
let client;


if (isLocal) {
    // If running locally, point to your local DynamoDB endpoint
    client = new DynamoDBClient({
        endpoint: "http://docker.for.mac.localhost:8000", // Adjust the endpoint based on your local DynamoDB setup
        region: 'local', // Set a region for local development
    });
} else {
    // Use the default AWS DynamoDB endpoint when not running locally
    client = new DynamoDBClient({});
}




const ddbDocClient = DynamoDBDocumentClient.from(client);
const tableName = process.env.SAMPLE_TABLE;


export const post = async (conversation, id) => {
    try {
        var params = {
            TableName: tableName,
            Item: {
                id: id,
                messages: conversation
            }
        };
        const result = await ddbDocClient.send(new PutCommand(params));
        return { result: result, message: "Item added or updated" };
    } catch (err) {
        throw err;
    }
};


export const deleteTable = async () => {
    try {
        const params = {
            TableName: tableName
        };
        await ddbDocClient.send(new DeleteTableCommand(params));
        return { message: "Table deleted successfully" };
    } catch (err) {
        console.error('Error deleting table:', err);
        throw err;
    }
};

export const createTable = async () => {
    try {
        const params = {
            TableName: tableName,
            KeySchema: [
                { AttributeName: 'id', KeyType: 'HASH' }
            ],
            AttributeDefinitions: [
                { AttributeName: 'id', AttributeType: 'S' }
            ],
            ProvisionedThroughput: {
                ReadCapacityUnits: 5,
                WriteCapacityUnits: 5
            }
        };

        await ddbDocClient.send(new CreateTableCommand(params));
        return { message: 'Table created successfully' };
    } catch (err) {
        throw err;
    }
};

export const getConversation = async (id) => {
    try {
        const command = new GetCommand({
            TableName: tableName,
            Key: {
                id: id
            },
        });

        const response = await ddbDocClient.send(command)
        console.log("Success - item retrieved", response);
        var item = response.Item;
    } catch (err) {
        console.error('Error retrieving item:', err);
        throw err;
    }
    return item;
}