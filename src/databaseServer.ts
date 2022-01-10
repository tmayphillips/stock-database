import * as express from 'express'
import * as cors from 'cors'
import * as http from 'http'
import {QueryResult, Client} from 'pg'
// import { doQuery } from './query.service'

export class StockDatabaseServer {
    public static readonly PORT: number = 8080 // Default local port
    public static readonly SYMBOLS: string[] = ['AAPL', 'TSLA', 'NVDA', 'JPM', 'BAC', 'NBR', 'GOOG', 'AXP', 'COF', 'WFC', 'MSFT', 'FB', 'AMZN', 'GS', 'MS', 'V', 'GME', 'NFLX', 'KO', 'JNJ', 'CRM', 'PYPL', 'XOM', 'HD', 'DIS', 'INTC', 'COP', 'CVX', 'RDS.A', 'OXY', 'BP', 'MPC', 'SLB', 'PSX', 'VLO']

    private app: express.Application
    private server: http.Server
    private port: string | number
    private connectionString: string

    constructor() {
        this.createApp()
        this.listen()
    }

    private createApp(): void {
        this.app = express()
        this.app.use(cors())
        this.server = http.createServer(this.app)
        this.port = process.env.PORT || StockDatabaseServer.PORT
        this.connectionString = process.env.DATABASE_URL
    }

    private listen(): void {
        this.server.listen(this.port, () => {
            console.log('Running server on port %s', this.port)
        })

        try{StockDatabaseServer.doQuery('SELECT * FROM min5_prices')
        .then((resp: QueryResult)=>
        console.log('this is the db response ', resp)
        )}
        catch(e){
            console.log('failed')
        }


    }

    public getApp(): express.Application {
        return this.app
    }

    public static doQuery = (query: string): Promise<QueryResult>=>{
        return new Promise((resolve, reject)=>{
            const client: Client = new Client({
                connectionString: 'postgres://vujwyosxlhitrw:8e2e84a5507c45cf3c54802e97948abd2ebb73ad29453ec3558f64cbe02469e7@ec2-3-228-236-221.compute-1.amazonaws.com:5432/djvd7ebilq70q',
                ssl: {
                    rejectUnauthorized: false
                }
            })
            client.connect((connectError: Error)=>{
                if(connectError)
                    // return reject(connectError.message)
                    console.log('error')
    
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

    

    
}