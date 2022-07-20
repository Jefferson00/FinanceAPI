import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import * as firebase from 'firebase-admin';

let serviceAccount = {
  project_id: null,
  private_key: null,
  client_email: null,
};

if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY 
  )
}

const firebase_params = {
  projectId: serviceAccount?.project_id || process.env.FIREBASE_PROJECT_ID, 
  privateKey: serviceAccount.private_key || process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  clientEmail: serviceAccount.client_email || process.env.FIREBASE_CLIENT_EMAIL,
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  // eslint-disable-next-line prettier/prettier
  private defaultApp: any;

  constructor() {
    this.defaultApp = firebase.initializeApp({
      credential: firebase.credential.cert(firebase_params),
      databaseURL: ''
    })
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  use(req: Request, res: Response, next: Function) {
    const token = req.headers.authorization;
    if (req.url === '/invoices/verify') return next();
    if (token === undefined) return this.accessDenied(req.url, res);
    if(token !== null && token !== '' && token !== undefined){
      this.defaultApp.auth().verifyIdToken(token.replace('Bearer ', ''))
        .then(async decodedToken => {
          if (decodedToken) next();
        }).catch(error => {
          console.log(error);
          this.accessDenied(req.url, res);
        });
    } else {
      next();
    }
  }

  private accessDenied(url: string, res: Response) {
    res.status(403).json({
      statusCode: 403,
      timestamp: new Date().toISOString(),
      path: url,
      message: 'Access Denied'
    })
  }
}
