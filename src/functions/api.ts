import { 
    APIGatewayEvent, 
    APIGatewayProxyResult 
} from "aws-lambda";

import { 
    getDateForSortKey, 
    tableName,
    docClient,
    createAPIReturnObject,
} from "../common";

export async function handle(event: APIGatewayEvent): Promise<APIGatewayProxyResult> {
    const deviceId = event.pathParameters?.deviceId;
    if(!deviceId){
        return createAPIReturnObject(400, "No deviceId provided.");
    }

    // Parse the given start_date and end_date or use default values
    //      - start_date -> 7 days ago
    //      - end_date -> now
    const startDate = parseDateOrDefault(
        event.queryStringParameters?.start_date,
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    );
    const endDate = parseDateOrDefault(
        event.queryStringParameters?.end_date,
        new Date(),
    );

    // Check if startDate is before the endDate. Otherwise DynamoDB will 
    // throw an error.
    if(startDate > endDate){
        return createAPIReturnObject(400, "Start date is after end date");
    }

    // Fetch from DynamoDB
    try{
        const data = await docClient.query({
            TableName: tableName,
            KeyConditionExpression: 'pk = :pk and sk BETWEEN :start AND :end',
            ExpressionAttributeValues: {
                ':pk': deviceId,
                ':start': getDateForSortKey(startDate),
                ':end': getDateForSortKey(endDate),
            },
        });

        // Flatten all messages into a single array
        const out = data.Items?.map(i => i.data).flat();
        return createAPIReturnObject(200, JSON.stringify({
            data: out,
        }));
    }catch(e){
        console.error("Error executing DynamoDB query", e);
        return createAPIReturnObject(500, "Database error");
    }
}

/**
 * Tries to parse the given input string to a Date object. If it fails,
 * it returns the provided defaultValue.
 * Note: this could return 
 */
function parseDateOrDefault(input: string|undefined, defaultValue: Date): Date{
    // Input must be defined and its format must make some sense
    if(!input || /\d{4}-\d{2}-\d{2}/.test(input) === false){
        return defaultValue;
    }

    const tryParse = new Date(input);
    if(tryParse === undefined){
        return defaultValue;
    }

    return tryParse;
}