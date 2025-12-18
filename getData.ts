export type Root = {
  adv: Adv;
  advertiser: Advertiser;
  privilegeDesc: unknown;
  privilegeType: unknown;
  privilegeTypeAdTotalCount: unknown;
};

export type Adv = {
  advNo: string;
  classify: string;
  tradeType: string;
  asset: string;
  fiatUnit: string;
  advStatus: unknown;
  priceType: unknown;
  priceFloatingRatio: unknown;
  rateFloatingRatio: unknown;
  currencyRate: unknown;
  price: string;
  initAmount: unknown;
  surplusAmount: string;
  tradableQuantity: number;
  amountAfterEditing: unknown;
  maxSingleTransAmount: number;
  minSingleTransAmount: number;
  buyerKycLimit: unknown;
  buyerRegDaysLimit: unknown;
  buyerBtcPositionLimit: unknown;
  remarks: unknown;
  autoReplyMsg: unknown;
  payTimeLimit: number;
  tradeMethods: TradeMethod[];
  userTradeCountFilterTime: unknown;
  userBuyTradeCountMin: unknown;
  userBuyTradeCountMax: unknown;
  userSellTradeCountMin: unknown;
  userSellTradeCountMax: unknown;
  userAllTradeCountMin: unknown;
  userAllTradeCountMax: unknown;
  userTradeCompleteRateFilterTime: unknown;
  userTradeCompleteCountMin: unknown;
  userTradeCompleteRateMin: unknown;
  userTradeVolumeFilterTime: unknown;
  userTradeType: unknown;
  userTradeVolumeMin: unknown;
  userTradeVolumeMax: unknown;
  userTradeVolumeAsset: unknown;
  createTime: unknown;
  advUpdateTime: unknown;
  fiatVo: unknown;
  assetVo: unknown;
  advVisibleRet: unknown;
  takerAdditionalKycRequired: number;
  minFiatAmountForAdditionalKyc: unknown;
  inventoryType: unknown;
  offlineReason: unknown;
  assetLogo: unknown;
  assetScale: number;
  fiatScale: number;
  priceScale: number;
  fiatSymbol: string;
  isTradable: boolean;
  dynamicMaxSingleTransAmount: string;
  minSingleTransQuantity: string;
  maxSingleTransQuantity: string;
  dynamicMaxSingleTransQuantity: string;
  commissionRate: string;
  takerCommissionRate: unknown;
  minTakerFee: unknown;
  tradeMethodCommissionRates: unknown;
  launchCountry: unknown;
  abnormalStatusList: unknown;
  closeReason: unknown;
  storeInformation: unknown;
  allowTradeMerchant: unknown;
  adTradeInstructionTagInfoRets: unknown;
  isSafePayment: boolean;
  adAdditionalKycVerifyItems: unknown;
  isStarTraderAdditionalKycExclusion: unknown;
  isStarTraderCounterpartyConditionsExclusion: unknown;
  nonTradableRegions: unknown;
  invisibleType: unknown;
  invisibleTitle: unknown;
  invisibleReason: unknown;
  privilegeType: unknown;
};

export type TradeMethod = {
  payId: unknown;
  payMethodId: string;
  payType: string;
  payAccount: unknown;
  payBank: unknown;
  paySubBank: unknown;
  identifier: string;
  iconUrlColor: unknown;
  tradeMethodName: string;
  tradeMethodShortName?: string;
  tradeMethodBgColor: string;
};

export type Advertiser = {
  userNo: string;
  realName: unknown;
  nickName: string;
  margin: unknown;
  marginUnit: unknown;
  orderCount: unknown;
  monthOrderCount: number;
  monthFinishRate: number;
  positiveRate: number;
  advConfirmTime: unknown;
  email: unknown;
  registrationTime: unknown;
  mobile: unknown;
  userType: string;
  tagIconUrls: unknown[];
  userGrade: number;
  userIdentity: string;
  proMerchant: unknown;
  badges: string[];
  vipLevel: number;
  isBlocked: boolean;
  activeTimeInSecond: number;
};

export type Item = {
  price: number;
  advertiser: {
    userNo: string;
    nickName: string;
    badges: Array<string>;
    monthOrderCount: number;
    monthFinishRate: number;
    positiveRate: number;
    tradableQuantity: number;
    maxSingleTransAmount: number;
    minSingleTransAmount: number;
  };
};

const getBuySellData = async (type: "SELL" | "BUY"): Promise<Array<Item>> => {
  const jsonResponse = await fetch(
    "https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search",
    {
      method: "POST",
      body: JSON.stringify({
        fiat: "BOB",
        page: 1,
        rows: 20,
        tradeType: type,
        asset: "USDT",
        countries: [],
        proMerchantAds: false,
        shieldMerchantAds: false,
        filterType: "all",
        periods: [],
        additionalKycVerifyFilter: 0,
        publisherType: "merchant",
        payTypes: [],
        classifies: ["mass", "profession", "fiat_trade"],
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    }
  );
  if (!jsonResponse.ok) {
    console.log(jsonResponse.json());
    return [];
  }
  const jsonData = await jsonResponse.json();

  const { data } = jsonData as { data: Array<Root> };

  let dataToStore: Array<Item> = [];
  if (data?.length) {
    dataToStore = data
      .filter((item) => {
        return !item.privilegeType;
      })
      .filter((item) => {
        return (
          item.advertiser.monthOrderCount > 100 &&
          item.adv.tradableQuantity > 100 &&
          item.adv.maxSingleTransAmount >= 1000 &&
          item.adv.minSingleTransAmount <= 25000
        );
      })
      .map((item) => {
        const { adv, advertiser } = item;
        const {
          price,
          tradableQuantity,
          maxSingleTransAmount,
          minSingleTransAmount,
        } = adv;
        return {
          price: Number(price),
          advertiser: {
            userNo: advertiser.userNo,
            nickName: advertiser.nickName,
            badges: advertiser.badges,
            monthOrderCount: advertiser.monthOrderCount,
            monthFinishRate: advertiser.monthFinishRate,
            positiveRate: advertiser.positiveRate,
            tradableQuantity: Number(tradableQuantity),
            maxSingleTransAmount: Number(maxSingleTransAmount),
            minSingleTransAmount: Number(minSingleTransAmount),
          },
        };
      });
  }
  return dataToStore;
};
export { getBuySellData };

if (import.meta.main) {
  console.log("Buy Data");
  await getBuySellData("BUY").then(console.log).catch(console.error);
  console.log("Sell Data");
  await getBuySellData("SELL").then(console.log).catch(console.error);
}
