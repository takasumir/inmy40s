import { render } from "preact";
import { html } from "htm/preact";

const PaAd = ({ item }) =>
  html`<div
    class="pa p-4 basis-xs w-xs border-4 rounded-xl border-[#1A237E]"
    data-asin="${item.ASIN}"
    id="${item.ASIN}"
  >
    <a
      href="${item.DetailPageURL}"
      aria-label="${item.ItemInfo.Title.DisplayValue}"
    >
      <img
        src="${item.Images.Primary.Medium.URL}"
        width="160"
        height="160"
        class="mx-auto size-[160px] object-contain"
    /></a>
    <div class="text-base font-bold truncate mb-2">
      ${item.ItemInfo.Title.DisplayValue}
    </div>
    <div class="text-center">
      <span class="price"
        >${item.Offers?.Listings[0]?.Price?.DisplayAmount}</span
      >
      <a
        class="inline-block rounded-full ml-4 py-2 px-4 bg-[#1A237E] transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 hover:bg-indigo-500"
        href="${item.DetailPageURL}"
        >Amazonで見る</a
      >
    </div>
  </div> `;

const paContainers: NodeList = document.querySelectorAll(".pa");
const asins: Set<string> = new Set(
  [...paContainers].map((ele) => ele.dataset.asin),
);

async function getItems(asins) {
  const res: Response = await fetch("/paapi/" + [...asins].join("/"), {
    mode: "cors",
  });
  if (res.status === 200) {
    console.log(res);
    return res.json();
  } else {
    console.log("No content");
    return null;
  }
}

async function renderItems(asins, containers) {
  const res = await getItems(asins);
  if (res) {
    const items = res.ItemsResult.Items;
    containers.forEach((ele) => {
      const item = items.find((item) => item.ASIN === ele.dataset.asin);
      console.log(ele);
      console.log(document.getElementById(item.ASIN));
      render(html`<${PaAd} item=${item} />`, ele.parentNode, ele);
    });
  }
}

if (paContainers.length > 0) {
  renderItems(asins, paContainers);
}
