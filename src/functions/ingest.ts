import { APIGatewayEvent, APIGatewayProxyEventV2 } from "aws-lambda";
import {
    tableName,
    EZStoreDynamoItemMetric,
    getDateForSortKey,
    docClient,
    createAPIReturnObject
} from "../common";

export async function handle(event: APIGatewayProxyEventV2) {
    const deviceId = event.pathParameters?.deviceId;
    const body = event.body;

    if(deviceId === undefined || body === undefined){
        return createAPIReturnObject(400, "No deviceId or body");
    }

    // Decode the JSON body    
    let bodyJson: object;
    try{
        bodyJson = JSON.parse(body);
    }catch(e){
        return createAPIReturnObject(400, "No valid JSON provided");
    }

    // Write it to DynamoDB
    const sortKey = getDateForSortKey(new Date());
    const dataEntry: EZStoreDynamoItemMetric = {
        timestamp: Date.now(),
        ...bodyJson
    };

    // TODO: handle any errors that might arise from items growing too big.
    //       I've tested that at least 4400 items can be stored
    //       for a single device on any given day.
    await docClient.update({
        TableName: tableName,
        Key: {
            pk: deviceId,
            sk: sortKey,
        },
        UpdateExpression: "SET #data = list_append(if_not_exists(#data, :empty_list), :data_entry)",
        ExpressionAttributeNames: {
            '#data': 'data',
        },
        ExpressionAttributeValues: {
            ":empty_list": [],
            ":data_entry": [dataEntry],
        },
    });

    return createAPIReturnObject(200, JSON.stringify({
        success: true,
    }));
};
