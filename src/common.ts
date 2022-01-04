import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyResult } from "aws-lambda";

const dynamoClient = new DynamoDB({ region: process.env.region });
export const tableName = process.env.TABLE_NAME ?? "";
export const docClient = DynamoDBDocument.from(dynamoClient);

export interface EZStoreDynamoItemMetric {
    timestamp: number;
    [key: string]: string | number | boolean;
}

/**
 * Takes a Date object as input and returns the sort key for
 * the DynamoDB item.
 */
export function getDateForSortKey(date: Date){
    return "reading-" + date.toISOString().substring(0, 10);
}

export function createAPIReturnObject(statusCode: number, body: string): APIGatewayProxyResult{
    const output: APIGatewayProxyResult = {
        statusCode: statusCode,
        headers: {
            "content-type": "application/json",
        },
        body: body,
    }

    if(statusCode !== 200){
        output.body = JSON.stringify({
            "error": body,
        });
    }

    return output;
}
