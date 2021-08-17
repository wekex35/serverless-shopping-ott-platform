const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient();

const DbHandler = {
    async get(ID, TableName) {
        const params = {
            TableName,
            Key: {
                ID,
            },
        };
        const data = await documentClient.get(params).promise();
        if (!data || !data.Item) {
            throw Error(`There was an error fetching the data for ID of ${ID} from ${TableName}`);
        }
        console.log(data);
        return data.Item;
    },

    async write(data, TableName) {    
        const params = {
            TableName,
            Item: data,
        };
        const res = await documentClient.put(params).promise();
        if (!res) {
            throw Error(`There was an error inserting ID of ${data} in table ${TableName}`);
        }
        return data;
    },

    async getAll(TableName) {    
        const params = {
            TableName,           
        };
        const res = await documentClient.scan(params).promise();
        if (!res) {
            throw Error(`There was an error in Reading table ${TableName}`);
        }
        // console.log(res);
        return res['Items'];
    },
};
module.exports = DbHandler;
