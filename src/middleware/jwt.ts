import { Request, Response, NextFunction } from "express";
export interface AuthOptions {
  authUrl: string;
}

function extractToken(req: Request) {
  if (
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "Bearer"
  ) {
    return req.headers.authorization.split(" ")[1];
  } else if (req.query && req.query.token) {
    return req.query.token;
  }
  return null;
}

export const checkJwt =
({ authUrl }: AuthOptions) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const token = extractToken(req);
    if (!token || typeof token !== "string") {
      res.send(401);
      return;
    }

    try {
      const { payload } = await validateToken(token, authUrl);
      req.auth = { token, payload };
      next();
    } catch (e) {
      res.send(401);
    }
  };

  export const validateToken = async(token: string, authUrl: string) => {
    try {
      const response = await fetch(authUrl, {
        method: 'GET',
        headers: {
          'accept': '*/*',
          'idm_tx_ref': '00000000-0000-0000-0000-000000000000',
          'X-IDM-Brand-Source': 'wicked',
          'fr_token': token,
          'API-Version': '2023.2'
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json(); // Parse the response as JSON
      /**
       * Example response:
       * {
       *  "result": {
       *    "code":200,
       *    "message":"OK",
       *    "description":"Operation completed successfully."
       *  },
       *  "idm_tx_ref":"00000000-0000-0000-0000-000000000000",
       *  "profile": {
       *    "_id":"fb09e613-3c62-4cee-ba5a-5b44b40c2f26",
       *    "_rev":"2","sn":"Nolet","mail":"jeremiah.nolet@nbcuni.com","country":"US","userName":"jeremiah.nolet@nbcuni.com","givenName":"Jeremiah","episodeCount":3,"emailVerified":false}}
       */
      console.log("Identity check result >>>", data); // Handle the JSON data
      if (data && data.result && data.result.code == 200) {
        return {
          payload: {
            sub: data.profile._id
          }
        };
      }  
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
      return {
        payload: {}
      };
    }
    console.log("Invalid Token", token);
    return {
      payload: {}
    };
  }