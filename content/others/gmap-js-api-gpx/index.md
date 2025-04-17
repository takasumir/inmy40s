---
categories:
  - ブログ
date: "2025-02-15T23:43:49+09:00"
description: description
draft: false
images:
  - images/undraw_adventure-map_8hg8.png
summary: Google Maps Javascript API を使って地図にGPXログを表示させる方法を解説します。
tags:
  - Webサービス
  - マップ
title: GPXログをGoogleマップに描画する Google Maps Javascript API
js: js/gmap.ts
---

サイクリングや登山記録をGPSサイコンやスマホアプリで記録し、Google Maps Javascript API や Mapbox を使ってブログにルートを載せています。Googleマップの場合座標データをPolylineとして地図に描画しますが、座標データの形式が LatLng オブジェクトで指定する必要があります。 GPX データを LatLng オブジェクトに変換する方法をご紹介します。

ちなみに外部ライブラリを使いJavaScriptだけで完結する方法もありますが、なるべくWebページを重くしたくないのであらかじめオフラインで変換して変換後のテキストデータをJavaScriptに貼り付ける方法です。

## やりたいこと

GPSサイコンで記録したルートを描画したこんなマップを作りたい。

{{< gmap json="track.json" center="{ \"lng\": 135.545, \"lat\": 34.8505 }" zoom="11" style="roadmap" >}}

## LatLngオブジェクト

LatLngオブジェクトとは、緯度(Lat)、経度(Lng)をキーに持つJavaScriptオブジェクトです。

```javascript
{ lat: -28, lng: 137 }
```

複数の座標を線でつなぐには、LatLngオブジェクトを配列に格納し、Polylineとして地図に描画します。

```javascript
const coords = [ {lat:34.79459,lng:135.50789},
                 {lat:34.79454,lng:135.50785},
                 {lat:34.79448,lng:135.50799},
                 {lat:34.79446,lng:135.50899} ];

function initMap() {
  const  map1 = new google.maps.Map(document.getElementById("map1"), {
    center: {lat:34.8385,lng:135.507},
      zoom: 11,
    });
    const polyRoute = new google.maps.Polyline({
      path: route,
      strokeColor: "#2222FF",
      strokeOpacity: 0.8,
      strokeWeight: 4
    });
    polyRoute.setMap(map1);
}
```

GPX(XML)の緯度、経度の数値をLatLngオブジェクトに変換するだけなのですが、意外と「このツール一発でできる」というのがなかったので覚書です。

## 方法1: GPSBabelでCSVに変換後、AWKを使う

GPSBabel は様々な形式の GPS
データを相互変換するフリーソフトです。詳しくは下の記事をご参照ください。

{{< linkcard "/others/gpsbabel" >}}

GPXファイルを ` log.gpx `
とします。GPSBabelでCSV形式に変換します。出力先は標準出力とします。

```sh
$ gpsbabel -i gpx -f log.gpx -o csv -F -
34.80437, 135.53217, 
34.80405, 135.53316, 
34.80405, 135.53315, 
34.80411, 135.53300, 
...
```

これをAWKで処理します。フィールドセパレータをコンマとスペースにして各行の
` $1 ` , ` $2 ` に ` lat: ` , ` lng: `
という文字を付けて間にコンマを挟み ` {} `
で囲むだけです。最初と最後に配列の ` [ ` と ` ] `
を出力しています。パイプでつなぐとこんな感じです。

```.sh
$ gpsbabel -i gpx -f log.gpx -o csv -F - \
  | awk -F", " 'BEGIN {OFS=" "; print "const route = ["}{ print "{lat:", $1, ", " "lng:",$2, "}," }END{ print "];"}'
const route = [
{lat: 34.80437 , lng: 135.53217 },
{lat: 34.80405 , lng: 135.53316 },
{lat: 34.80405 , lng: 135.53315 },
{lat: 34.80411 , lng: 135.53300 },
... ];
```

出力されたテキストを貼り付けておしまいです。

## 方法2: GPSBabelでGeoJSONに変換後、jqを使う

JSON形式をsedやAWKのようにフィルタ、編集できる
[jq](https://stedolan.github.io/jq/)
というツールを使う方法です。GPXからGeoJSONへの変換はGPSBabelを使います。

```sh
$ gpsbabel -i gpx -f log.gpx -o geojson -F - \
  | jq '[.features[].geometry.coordinates[] | {lat: .[1], lng: .[0]}]'
[
  {
    "lat": 34.804371,
    "lng": 135.532172
  },
  {
    "lat": 34.804054,
    "lng": 135.533159
  },
...
]
```

コマンドはAWKを使うより短くなりました。しかしこのjq、使い慣れて理解できるようになれば強力なツールだと思うのですがなかなかクセがあり難しいです。

JavaScriptのオブジェクトのようにデータを取り出すことができます。座標データは
` .features[].geometry.coordinates[] ` で指定できます。この結果は、\[
**経度** , **緯度**
\]の配列が座標の数だけ返されます。GeoJSONとLatLng形式とでは緯度と経度が逆の順番になっていることに注意です。

次にこの複数の座標データをパイプで渡します。jqでは、複数の結果をパイプで渡す場合、パイプの右側は結果1つ1つに対して処理されるようになります。これがちょっとわかりにくいですね。また、\[
**経度** , **緯度** \]の配列は、緯度を ` .[1] ` 、経度を ` .[0] `
として参照できます。ということで ` | {lat: .[1], lng: .[0]} `
という記述になります。

最初と最後を ` [ ` と ` ] ` で囲むことで全体を配列に格納します。

## 方法3: GeoJSONに変換してloadGeoJson()メソッドでデータレイヤに読み込む

` map.data ` オブジェクトの ` loadGeoJson() `
メソッドを使えばGeoJSONデータを直接扱うこともできます。

```javascript
map.data.loadGeoJson('google.json');
```

スタイルはデータレイヤで指定します。

```javascript
map1.data.setStyle({
  strokeColor: "#2222FF",
  strokeOpacity: 0.8,
  strokeWeight: 4
});
```

` loadGeoJson() `
の引数はURLですが、ヒアドキュメントで直接JSONテキストを貼り付けても動作します。

これが一番簡単ですが、方法1,2と比べると若干遅い気がします。

## まとめ

Google Maps JavaScirpt API
を使って地図にGPSログを描画する方法を3通りご紹介しました。元がGPX形式であればどの方法も一旦GPSBabelなどでCSVかGeoJSONに変換してやる必要があります。

一番お手軽なのは ` loadGeoJson() `
を使う方法でしょう。速度を優先するのであれば ` LatLng `
形式に変換するのがおすすめです。CSVへ変換してAWKを使うか、GeoJSONに変換してjqを使うかは好みだと思います。
