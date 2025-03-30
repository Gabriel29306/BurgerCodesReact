/* 
Thanks to Orafilynie for the original code !

https://github.com/Orafilynie/BurgerCodeGen/
*/

import Captcha from "./captcha";
import axios, { AxiosError, AxiosResponse } from "axios";
import { OfferNotAvailableError } from "./errors";
import 'react-native-get-random-values';
import { v4 as uuidv4 } from "uuid";
import md5 from "md5";


// Types
type ProductTypeKey = "BURGER" ;
type BurgerChoice = "B" | "V";

interface ProductTypeInfo {
  name: string;
  code: string;
  requiredChoices: boolean;
}

interface PromotionIdsMap {
  [key: string]: string;
}

interface ApiHeaders  {
  "Host": string;
  "Accept": string;
  "x-application": string;
  "x-version": string;
  "Accept-Language": string;
  "User-Agent": string;
  "Connection": string;
  "x-platform": string;
  "Content-Type": string;
  "x-device"?: string;
}

interface ApiData {
  king: string;
  hash: string;
  queen: string;
}

interface Coupon {
  restaurantCode: string;
  [key: string]: any;
}

interface Operation {
  name: string;
  code: string;
  coupons?: Coupon[];
  [key: string]: any;
}

interface GeneratedCodes {
  firstCode: string;
  secondCode: string;
}

// Constants
const PEPPER: string = "merci,votrecommandeabienetepriseencompte#jejoueautennis&TupeuxpasToast!@burritoking5console.log(Oups,uneerreurestsurvenue)";
const MAX_RETRIES: number = 25;
const RETRY_DELAY: number = 1000;
const API_HEADERS: ApiHeaders = {
  "Host": "webapi.burgerking.fr",
  "Accept": "application/json, text/plain, */*",
  "x-application": "WEBSITE",
  "x-version": "10.19.0",
  "Accept-Language": "fr-FR,fr;q=0.9",
  "User-Agent": "Mobile/1639457264 CFNetwork/3826.400.120 Darwin/24.3.0",
  "Connection": "keep-alive",
  "x-platform": "APP_IOS",
  "Content-Type": "application/json"
};
const PROMOTION_IDS: PromotionIdsMap = { B: "7129189026081447688", V: "6645000801566560157" };

// Utilities
const retryOn503 = async <T>(requestFn: () => Promise<T>, maxRetries: number = MAX_RETRIES, delay: number = RETRY_DELAY): Promise<T> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      if (!(error instanceof AxiosError)) throw error;
      else {
        if (error.response?.status !== 503 && error.response?.status !== 500) throw error;
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error("Max retries reached for 503 errors");
};


const generateHash = (king: string): string => md5(king + PEPPER);

// Core functions
const createDeviceHeaders = (deviceId: string): ApiHeaders => ({
  ...API_HEADERS,
  "x-device": deviceId
});

const initializeApi = async (headers: ApiHeaders): Promise<void> => {
  await retryOn503(() => 
    axios.get('https://webapi.burgerking.fr/blossom/api/v13/public/app/initialize', { headers })
  );
};

const fetchOperations = async (data: ApiData, headers: ApiHeaders): Promise<Operation[]> => {
  const response: AxiosResponse = await retryOn503(() =>
    axios.post(
      'https://webapi.burgerking.fr/blossom/api/v13/public/operation-device/all',
      data,
      { headers }
    )
  );
  return response.data;
};

const getRestaurantCodes = (operations: Operation[]): string[] => {
  const targetProduct = {
    name: "Burger Mystère ou Veggie Mystère",
    code: "burger-mystere",
    requiredChoices: true
  };
  const codes: string[] = [];
  
  for (const operation of operations) {
    if (operation.name === targetProduct.name || operation.code === targetProduct.code) {
      codes.push(...(operation.coupons || []).map(c => c.restaurantCode));
      if (codes.length >= 2) break;
    }
  }
  
  if (!codes.length) throw new OfferNotAvailableError('No valid codes found');
  return codes.slice(0, 2);
};

const activateBurgerCodes = async (codes: string[], choices: BurgerChoice[], data: ApiData, headers: ApiHeaders): Promise<GeneratedCodes> => {
  const [firstChoice, secondChoice] = choices;
  const urls = codes.map((code, i) => 
    `https://webapi.burgerking.fr/blossom/api/v13/public/operation-device/burger-mystere/confirm-choice?` +
    `couponCode=${code}&promotionId=${PROMOTION_IDS[choices[i]]}`
  );

  const responses: AxiosResponse[] = await Promise.all(
    urls.map(url => 
      retryOn503(() => axios.post(url, data, { headers }))
    )
  );

  if (responses.some(r => r.status !== 200)) {
    throw new Error('Burger code activation failed');
  }

  return {
    firstCode: firstChoice + codes[0].substring(1),
    secondCode: secondChoice + codes[1].substring(1)
  };
};

// Main function
export const generateCodes = async (firstChoice: BurgerChoice | null = null): Promise<GeneratedCodes | { firstCode: string; secondCode: string }> => {
  try {
    const deviceId: string = uuidv4().toUpperCase();
    const headers: ApiHeaders = createDeviceHeaders(deviceId);
    const data: ApiData = {
      king: deviceId,
      hash: generateHash(deviceId),
      queen: await Captcha.resolve()
    };

    await initializeApi(headers);
    const operations: Operation[] = await fetchOperations(data, headers);
    const restaurantCodes: string[] = await getRestaurantCodes(operations);

    return await activateBurgerCodes(
      restaurantCodes,
      [firstChoice, firstChoice] as BurgerChoice[],
      data,
      headers
    );
  } catch (error) {
    console.error(`MYSTERY BURGER - Error • ${(error as any)?.message}`);
    throw error;
  }
};
