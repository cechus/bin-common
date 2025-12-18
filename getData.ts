export type Root = {
  adv: Adv;
  advertiser: Advertiser;
  privilegeDesc: any;
  privilegeType: any;
  privilegeTypeAdTotalCount: any;
};

export type Adv = {
  advNo: string;
  classify: string;
  tradeType: string;
  asset: string;
  fiatUnit: string;
  advStatus: any;
  priceType: any;
  priceFloatingRatio: any;
  rateFloatingRatio: any;
  currencyRate: any;
  price: string;
  initAmount: any;
  surplusAmount: string;
  tradableQuantity: number;
  amountAfterEditing: any;
  maxSingleTransAmount: number;
  minSingleTransAmount: number;
  buyerKycLimit: any;
  buyerRegDaysLimit: any;
  buyerBtcPositionLimit: any;
  remarks: any;
  autoReplyMsg: any;
  payTimeLimit: number;
  tradeMethods: TradeMethod[];
  userTradeCountFilterTime: any;
  userBuyTradeCountMin: any;
  userBuyTradeCountMax: any;
  userSellTradeCountMin: any;
  userSellTradeCountMax: any;
  userAllTradeCountMin: any;
  userAllTradeCountMax: any;
  userTradeCompleteRateFilterTime: any;
  userTradeCompleteCountMin: any;
  userTradeCompleteRateMin: any;
  userTradeVolumeFilterTime: any;
  userTradeType: any;
  userTradeVolumeMin: any;
  userTradeVolumeMax: any;
  userTradeVolumeAsset: any;
  createTime: any;
  advUpdateTime: any;
  fiatVo: any;
  assetVo: any;
  advVisibleRet: any;
  takerAdditionalKycRequired: number;
  minFiatAmountForAdditionalKyc: any;
  inventoryType: any;
  offlineReason: any;
  assetLogo: any;
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
  takerCommissionRate: any;
  minTakerFee: any;
  tradeMethodCommissionRates: any;
  launchCountry: any;
  abnormalStatusList: any;
  closeReason: any;
  storeInformation: any;
  allowTradeMerchant: any;
  adTradeInstructionTagInfoRets: any;
  isSafePayment: boolean;
  adAdditionalKycVerifyItems: any;
  isStarTraderAdditionalKycExclusion: any;
  isStarTraderCounterpartyConditionsExclusion: any;
  nonTradableRegions: any;
  invisibleType: any;
  invisibleTitle: any;
  invisibleReason: any;
  privilegeType: any;
};

export type TradeMethod = {
  payId: any;
  payMethodId: string;
  payType: string;
  payAccount: any;
  payBank: any;
  paySubBank: any;
  identifier: string;
  iconUrlColor: any;
  tradeMethodName: string;
  tradeMethodShortName?: string;
  tradeMethodBgColor: string;
};

export type Advertiser = {
  userNo: string;
  realName: any;
  nickName: string;
  margin: any;
  marginUnit: any;
  orderCount: any;
  monthOrderCount: number;
  monthFinishRate: number;
  positiveRate: number;
  advConfirmTime: any;
  email: any;
  registrationTime: any;
  mobile: any;
  userType: string;
  tagIconUrls: any[];
  userGrade: number;
  userIdentity: string;
  proMerchant: any;
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

if (
  require.main === module ||
  import.meta.url === `file://${process.argv[1]}`
) {
  console.log("Buy Data");
  await getBuySellData("BUY").then(console.log).catch(console.error);
  console.log("Sell Data");
  await getBuySellData("SELL").then(console.log).catch(console.error);
}
