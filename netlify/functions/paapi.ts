import type { Config, Context } from "@netlify/functions";
const amazonPaapi = require("amazon-paapi");

const commonParameters = {
  AccessKey: "AKIAIZ3UGYYMRIOE6H3A",
  SecretKey: "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",
  PartnerTag: "takasumir-22",
  PartnerType: "Associates",
  Marketplace: "www.amazon.co.jp",
};
const requestParameters = {
  ItemIds: ["B09MCRYG2Y"],
  ItemIdType: "ASIN",
  Condition: "New",
  Resources: [
    "Images.Primary.Medium",
    "ItemInfo.Title",
    "Offers.Listings.Price",
  ],
};

export default async (req: Request, context: Context) => {
  console.log(context.params.asin);
  const asins = context.params.asin.split("/");
  requestParameters.ItemIds = asins;

  let res: string | null = "";

  /** Promise */
  await amazonPaapi
    .GetItems(commonParameters, requestParameters)
    .then((data) => {
      res = JSON.stringify(data);
      return new Response(res, {
        status: 200,
        statusText: "Netlify functions ppapi returned",
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    })
    .catch((error: unknown) => {
      console.log(error);
      res = null;
      return new Response(res, {
        status: 500,
        statusText: "Internal Server Error",
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    });
};
// URLを https://ドメイン名/paapi/「asin」とし、asinをパラメーターとして
// 関数本体へ渡す
export const config: Config = {
  path: "/paapi/:asin+",
};
