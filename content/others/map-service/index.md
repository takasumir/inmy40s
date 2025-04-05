---
categories:
  - ブログ
date: "2025-02-15T23:43:28+09:00"
description: ブログに地図を埋め込みたい！というときのマップサービスを比較しました。簡単にコピペできるサービスからJavaScriptを使った本格的な方法まで解説します。
draft: false
images:
  - images/undraw_map_cuix.svg
summary: ブログに地図を埋め込みたい！というときのマップサービスを比較しました。簡単にコピペできるサービスからJavaScriptを使った本格的な方法まで解説します。
tags:
  - Webサービス
  - マップ
title: ブログに埋め込むマップサービス比較！
js:
  - js/gmap.ts
  - js/mbox.ts
  - js/leaflet.ts
js_cdn:
  - "https://api.mapbox.com/mapbox-gl-js/v2.3.0/mapbox-gl.js"
css_cdn:
  - "https://api.mapbox.com/mapbox-gl-js/v2.3.0/mapbox-gl.css"
---

## ブログに地図を埋め込みたい

自転車や山登り、キャンプなどアウトドア系の記事を書く際に、どうしてもブログに地図を埋め込んで自転車や山登りのルート軌跡や、キャンプ場の位置などを紹介したくなります。

おなじみの Google マップや、サイクリングのワークアウトを記録する
Strava、山登り用の地図アプリである Yamap などは簡単に HTML
コードを取得して地図を埋め込むことができます。

地図の表示方法をカスタマイズしたり、複数のポイントを表示させたりもう少し凝ったことをしたい場合は
Google マイマップや、API を使ったサービスを利用する必要が出てきます。

これまでこのブログで使ってきたマップサービスを比較してみたいと思います。

## マップサービスに期待する機能と比較基準

ブログへ埋め込むことを前提としたマップサービスへ期待する機能を考えたときに、下記を列挙してみました。

-   利用の簡単さ
-   埋め込みマップ内での移動、拡縮
-   GPS 記録ルートの表示
-   アイコン等、補足情報の表示
-   等高線の表示

上記を基準に、各マップサービスを比較してみたいと思います。

## 初心者向けマップサービス

### シンプルな Google マップの共有機能

地図サービスとして 1 番有名な Google
マップですが、簡単に埋め込みコードを取得することができます。

Google
マップ上でセンターに表示したい位置を選択し、共有ボタンを押します。「共有」ウィンドウが出るので「地図を埋め込む」を選択すると
HTML コードが表示されます。これをブログにコピペするだけです。

[他のユーザーとマップやルートを共有する](https://support.google.com/maps/answer/144361?hl=ja&co=GENIE.Platform%3DDesktop)

機能はシンプルで、選択した場所がセンターとしてピンが表示されます。場所の名前、住所等の情報が左上に表示されます。

{{< gmap-iframe "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d37383.23567823202!2d135.22890469615092!3d34.08981258006924!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x600748a9f5b4e4ad%3A0x1a8839962955e657!2z6bey44O25bOw44Kz44K544Oi44K544OR44O844Kv!5e0!3m2!1sja!2sjp!4v1634435045190!5m2!1sja!2sjp" >}}

場所がどこにあるかを表示したい場合はこれで十分ですね。

| 項目 | 評価|
| --- |:---:|
| 利用の簡単さ| ○|
| 移動、拡縮| ○|
| GPS| 記録ルートの表示| ✕|
| アイコン等、補足情報の表示| ✕|
| 等高線の表示| ✕|

### 地図をカスタマイズできる Google マイマップ

上述の Google マップでは 1
つの場所をセンターにピン表示することができますが、ルートを書いたり、ピンやアイコンを複数立てたりしたい場合は
Google マイマップが便利です。

{{< gmymap.inline >}}
   <iframe style="width:100%; height:320px" name="Googleマイマップ" src="https://www.google.com/maps/d/embed?mid=1eyYoRUCPNVd7E38qpxnRaKLFM_MkbWq0">
   </iframe>
{{< /gmymap.inline >}}


ルートに関しては、GPS
ログを読み込むことはできず、マイマップの中で線を書いていくことしかできません。

| 項目| 評価|
| --- |:---:|
| 利用の簡単さ| ○|
| 移動、拡縮| ○|
| GPS| 記録ルートの表示| ✕|
| アイコン等、補足情報の表示| ✕|
| 等高線の表示| ✕|

[Google マイマップ](https://www.google.co.jp/intl/ja/maps/about/mymaps/)

### サイクリングルートの埋め込み STRAVA

ランニングやサイクリングの GPS ログを地図に表示したい場合、STRAVA
の埋め込みを利用するのが手っ取り早いです。

Google マップと同じように共有ボタンで HTML
埋め込みコードを取得してコピペするだけです。

{{< strava.inline >}}
<iframe allowtransparency="true" frameborder="0" height="405" loading="lazy" scrolling="no" src="https://www.strava.com/activities/4264895189/embed/98bdc56b9e99ebbc6a48352d1af557ba58bb8028" width="590" style="max-width:100%">
</iframe>
{{< /strava.inline >}}

ただし、埋め込み地図上でドラッグや拡縮ができないこと、埋め込み地図の縦横幅が固定サイズなのでスマホでの表示がいまいちだったりするのでレスポンシブ対応には少し工夫が要ります。

| 項目| 評価|
| --- |:---:|
| 利用の簡単さ| ○|
| 移動、拡縮| ✕|
| GPS| 記録ルートの表示| ○|
| アイコン等、補足情報の表示| ✕|
| 等高線の表示| ✕|

STRAVA 埋め込みのレスポンシブ対応は下記の記事をご参考ください。

![thumbnail](./images/strava-responsive1.webp)

::: text-contents
### [Stravaのブログ埋め込みで幅が切れる・はみ出すときの対処法](https://www.bchari.com/2021/09/strava-responsive.html) {#stravaのブログ埋め込みで幅が切れるはみ出すときの対処法 .title}

自転車で走ったコースをマップ上に記録できる便利なSTRAVAですが、ブログにコースを埋め込む際に、幅
\...
:::

[STRAVA](https://www.strava.com/)

### 登山ルートの埋め込み Yamap

Yamap は登山用の GPS ログ記録アプリです。上述の STRAVA
と同じようにブログに登山記録の地図を埋め込むことができます。

登山用なので、地図に登山ルートや標高線が入っているのが特徴です。レスポンシブ対応で、スマホで表示させてもSTRAVAのように地図の表示範囲がズレたりしません。

{{< yamap.inline >}}
<script src="https://yamap.com/widget.js"></script>
<blockquote data-mode="map" data-source="activities/8544940" data-width="100%" data-yamap-widget=""><a href="https://yamap.com/activities/8544940">湧出岳・葛木岳・金剛山</a>/<a href="https://yamap.com/users/336842">はせやん</a>さんの<a href="https://yamap.com/mountains/118">金剛山</a>・<a href="https://yamap.com/mountains/1343">湧出岳</a>・<a href="https://yamap.com/mountains/14933">葛木岳</a>の活動データ | <a href="https://yamap.com">YAMAP / ヤマップ</a></blockquote>
{{< /yamap.inline >}}

ただ、こちらも埋め込み地図を直接ドラッグ、拡縮できないのと、地図上にいろいろ情報が表示されて地図そのものが見にくいのが微妙です。

| 項目| 評価|
| --- |:---:|
| 利用の簡単さ| ○|
| 移動、拡縮| ✕|
| GPS| 記録ルートの表示| ○|
| アイコン等、補足情報の表示| ✕|
| 等高線の表示| ○|

[YAMAP](https://yamap.com/)

## 中・上級者向けマップサービス

ここまで、ユーザー登録をして地図の埋め込み HTML
コードを取得、コピペするだけで利用できるマップサービスをご紹介してきました。これらのサービスは、簡単に利用できるものの、目的地やルートを複数表示できなかったり、余計な情報が表示されたりしてカスタマイズ性はあまりありません。

これからご紹介するマップサービスは、登録や使い方が面倒だったり一定以上のアクセス数があると有料になったりするためハードルが上がりますが、より自由に地図を書くカスタマイズできます。

### Google マップ Google Maps Platform

Google が提供しているクラウドコンピューティングサービス Google Cloud
Platform の中のサービスになります。Google マップを API
経由で呼び出せ、自由度の高い表現が可能です。

{{< gmap json="track2.json" center="{ \"lng\": 135.494, \"lat\": 34.833 }" zoom="11" >}}

有料サービスでアクセス数に応じた従量課金制ですが、\$200/月までは無料で利用できます。無料枠は
28,500
回表示分なので個人の趣味で利用する範囲ではそうそう超えることは無いでしょう。利用登録してアクセスキーを作成必要です。ドラッグや拡大縮小ができる
Dynamics Maps API (JavaScript API)の利用には、JavaScript
の知識が必要です。

いろいろな設定ができますが、等高線については縮尺によって出たり出なかったり、登山地図に使えるレベルのものでは無いので微妙です。

| 項目| 評価|
| --- |:---:|
| 利用の簡単さ| ✕|
| 移動、拡縮| ○|
| GPS| 記録ルートの表示| ○|
| アイコン等、補足情報の表示| ○|
| 等高線の表示| △|

[Google Maps Platform](https://developers.google.com/maps)

### マップボックス mapbox

Google Maps Platform
に似たようなサービスで、自由な地図表現を作ることができます。こちらも有料ですが
Web からのアクセスの場合 50,000 アクセス/月までは無料です。

地図のカスタマイズは mapbox 内で選択していくので JavaScript
を使う必要が無いため Google Maps Platform よりは敷居が低いです。

先にご紹介した STRAVA や YAMAP も地図の表示は mapbox
を使っているようです。

{{< mbox json="track1.json" center="{ \"lng\": 135.545, \"lat\": 34.8505 }" zoom="10.5" style="" >}}

| 項目| 評価|
| --- |:---:|
| 利用の簡単さ| ✕|
| 移動、拡縮| ○|
| GPS| 記録ルートの表示| ○|
| アイコン等、補足情報の表示| ○|
| 等高線の表示| ○|

[mapbox](https://www.mapbox.com/)

### uMap

完全にフリーの地図、OpenStreetMapを使ったサービスです。uMap自体も無料なのでGoogle
Maps
Platformやmapboxのようにアクセス数を気にする必要がなく、GPSログを読み込んだりピンを立てたりとuMap上で簡単に地図をカスタマイズできるので最強かもしれません！等高線の表示はなさそうです。今後積極的に活用していきたいマップサービスです。

{{< umap.inline >}}
<iframe allowfullscreen="" frameborder="0" height="300px" loading="lazy" src="//umap.openstreetmap.fr/ja/map/map_679912?scaleControl=false&amp;miniMap=false&amp;scrollWheelZoom=false&amp;zoomControl=true&amp;allowEdit=false&amp;moreControl=true&amp;searchControl=null&amp;tilelayersControl=null&amp;embedControl=null&amp;datalayersControl=true&amp;onLoadPanel=undefined&amp;captionBar=false" width="100%"></iframe>
{{< /umap.inline >}}

[フルスクリーン表示](//umap.openstreetmap.fr/ja/map/map_679912)

| 項目| 評価|
| --- |:---:|
| 利用の簡単さ| ○|
| 移動、拡縮| ○|
| GPS| 記録ルートの表示| ○|
| アイコン等、補足情報の表示| ○|
| 等高線の表示| ☓|

[uMap](https://umap.openstreetmap.fr/ja/)

### Leaflet

Leafletは、インタラクティブなマップを作成するフリーなJavaScriptライブラリです。Leaflet自体には地図データは無いのですが、OpenStreetMapや国土地理院の地理院タイルなど外部の地図データを使いマップを作成、表示します。

地理院タイルを読み込むことができるため、登山記録をブログに載せるには最適だと思います。使い方はGoogle
Maps PlatformのJavaScript
APIと同様、JavaScriptで記述する必要があるので少し敷居が高いですが、国土地理院にサンプルページ、ソースコードが公開されているので基本コピペで使えます。Leafletも地理院タイルもフリーなのがうれしいですね。

{{< leaflet.inline >}}
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
  integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
  crossorigin=""/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
  integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
  crossorigin=""></script>
{{< /leaflet.inline >}}
{{< leaflet json="track3.json" center="{ \"lng\": 135.86, \"lat\": 34.3685 }" zoom="15" style="" >}}

| 項目| 評価|
| --- |:---:|
| 利用の簡単さ| ☓|
| 移動、拡縮| ○|
| GPS| 記録ルートの表示| ○|
| アイコン等、補足情報の表示| ○|
| 等高線の表示| ○|

[Leaflet](https://leafletjs.com/)

### Google Earth Studio

正確にはマップサービスでは無く、Google Earth
の衛星画像から動画を作るサービスです。現在プレビュー版で、利用目的等を記入して申請（英語）し、申請が通れば無料で使えるようになります。

マップとしての使い方としては、スクリーンショット機能を利用して、静止画像をキャプチャし、キャンプ場や釣り場の紹介などを衛星画像にレタッチソフトでコメントを入れて地図のような画像を作るときに使っています。

![かぶと山キャンプ場マップ](./images/image843.jpg)

Googleマップや"Studio"の無い通常のGoogle Earthの衛星画像をキャプチャする方法もありますが、向きを変えたり鳥瞰図みたいにちょっと傾けたりと使い勝手が良いこと、引用元の表示がキャプチャ画像に入るためこちらを利用しています。

ちなみに、Google
マップをブログ等に引用する場合、出典元の表示が必要（Google
だけでなく地図の出典元もあったりする）であり、Google
マップの埋め込みコード取得した場合などは適切な表示が入れられますが、自分で画面キャプチャした場合などは自分で適切な表示をしなければならないため注意が必要です。

衛星画像の画面キャプチャが目的なので評価対象外とします。

[Google Earth Studio](https://www.google.com/earth/studio/)

## まとめ

様々なマップサービスをご紹介しましたが、どれも一長一短で場合によって使い分けています。


| 用途                   | サービス                           |
|-----------------------|-----------------------------------|
| 旅行記、キャンプ場の目的地| Googleマップ                       |
| 公園、キャンプ場内マップ  | Google Earth Studio |
| サイクリングコース紹介   | Google Maps Platform、uMap|
| 登山コース紹介          | mapbox or Leaflet + 地理院タイル|


uMapやLeafletは無料でいろいろ自由にカスタマイズできるので今後積極的に活用していきたいですが、手軽さではGoogleマップやSTRAVA、YAMAP埋め込みが楽ちんです。

今後機会があればそれぞれの使い方を詳しく紹介できたらと思います。
