const express = require('express')
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware')
const axios = require('axios')
const rateLimit = require('express-rate-limit')


const authservicePath = 'http://localhost:3001'
const app = express();

const limiter = rateLimit({
	windowMs: 2 * 60 * 1000, // 15 minutes
	max: 5, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})


const setupAndStartServer = ()=>{
    app.use(morgan('combined'));
    app.use(limiter);
    app.use('/bookingservice', async (req,res,next)=>{
        console.log(authservicePath);
        const url=`${authservicePath}/authservice/api/v1/user/isAuthenticated`
        console.log(url);
        const response = await axios.get(url,{
            headers:{
                'x-access-token':req.headers['x-access-token']
            }
        });
        console.log(response)
        next()
    })
    app.use('/bookingservice', createProxyMiddleware({ target: 'http://localhost:8000/', changeOrigin: true }));
    app.use('/authservice',createProxyMiddleware({ target: 'http://localhost:3001/', changeOrigin: true }))
    app.use('/flightservice',createProxyMiddleware({ target: 'http://localhost:3000/', changeOrigin: true }))
    
    app.get('/home',(req,res)=>{
        return res.json({message:"OK"})
    })
   app.listen(3005,()=>{
    console.log("Strting server at PORT 3005");
   })
}

setupAndStartServer();