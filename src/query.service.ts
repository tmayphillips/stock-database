import {QueryResult, Client} from 'pg'

const doQuery = (query: string): Promise<QueryResult>=>{
    return new Promise((resolve, reject)=>{
        const client: Client = new Client({
            connectionString: 'postgres://vujwyosxlhitrw:8e2e84a5507c45cf3c54802e97948abd2ebb73ad29453ec3558f64cbe02469e7@ec2-3-228-236-221.compute-1.amazonaws.com:5432/djvd7ebilq70q'
        })
        client.connect((connectError: Error)=>{
            if(connectError)
                return reject(connectError.message)

            client.query(query, (queryError: Error, queryResult: QueryResult)=>{
                if(queryError)
                    // return reject(queryError.message+`(${query})`)
                    return reject(queryError.message)

                client.end((endError: Error)=>{
                    return reject(endError? endError.message : 'error on client.end')
                })
                resolve(queryResult)
            })
        })
    })
}

module.exports = { doQuery }