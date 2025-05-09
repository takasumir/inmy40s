---
categories:
  - ブログ
date: "2025-02-15T23:43:29+09:00"
description: JavaScriptライブラリ、Leafletを使って国土地理院の地図をブログに埋め込む方法を解説します。
draft: false
images:
  - images/leaflet.webp
summary: JavaScriptライブラリ、Leafletを使って国土地理院の地図をブログに埋め込む方法を解説します。
tags:
  - Webサービス
  - マップ
  - leaflet
title: ブログに埋め込む登山地図はLeaflet+地理院タイルで決まり！
js: js/leaflet.ts
---

{{< leaflet.inline >}}
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
  integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
  crossorigin=""/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
  integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
  crossorigin=""></script>
{{< /leaflet.inline >}}
     
ブログで山行記を書く際に、登山ルートのGPSログやピンなどを配置して地図をブログ内に埋め込むと便利です。登山用地図は、等高線や登山用のルートまで表示された国土地理院の発行する2万5千分1地形図（通称2.5万図）や5万分1地形図（通称5万図）が定番ですが、オンラインでは
[地理院地図（電子国土Web）](https://maps.gsi.go.jp/)
で閲覧することができます。

この地理院地図の地図画像は、地理院タイルとして各種ライブラリから利用することができます。そこで、Lefletというインタラクティブな地図を埋め込むことができるライブラリから地理院タイルを読み込んで登山記録を地図に表示する方法をご紹介します。

## Lefletとは

[Leaflet](https://leafletjs.com/)
とは、Googleマップのようなインタラクティブな地図を作成するためのJavaScriptライブラリです。
[Google Maps Platform](https://mapsplatform.google.com/) のJavaScript
APIを使うのとほとんど同じことができますが、
[Leaflet](https://leafletjs.com/)は
オープンソースであり、無料で利用できます。

## 地理院地図、地理院タイルとは

[地理院地図](https://maps.gsi.go.jp/)
は、国土地理院が提供する地図閲覧サービスです。Googleマップに似ていますが、国土地理院の地図は、等高線などの地形に関する情報が詳しく描かれており、登山用には国土地理院の地形図が便利です。

地理院タイルとは、先述の地理院地図で使われている地図画像データをタイル状に区分けして外部ライブラリから利用できるようにしたものです。この地理院タイルをLeafletから利用することでGoogleマップのようにインタラクティブな地図を作ることができます。

## 地図を作って見ましょう

それでは早速、Lefletと地理院タイルを使って地図を表示させてみましょう。ほとんど国土地理院の
[地理院タイルを用いたサイト構築サンプル集](https://maps.gsi.go.jp/development/sample.html)
通りですが、登山記録として、GPSログやピンを追加で表示させます。

### HTMLとCSSの準備

GitHubの
[サンプルコード](https://github.com/gsi-cyberjapan/gsitiles-leaflet/blob/gh-pages/index.html)
を元に少し変更を加えます。

まずはhead部のlinkタグでLeafletのCSSとJavaScriptライブラリを読み込みます。最後の行は、GPSのログであるGPXファイルをLeafletで読み込むためのプラグインです。

ブログサービスによっては、headタグ内に追加できないかもしれません。例えば、Bloggerの場合は、記事作成画面でHTML編集モードにして本文先頭にlinkタグ、scriptタグをコピペすれば問題なく動きました。

``` html
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>GSI Tiles on Leaflet</title>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.6.0/dist/leaflet.css"
  integrity="sha512-xwE/Az9zrjBIphAcBb3F6JVqxf46+CDLwfLMHloNu6KEQCAWi6HcDUbeOfBIptF7tcCzusKFjFw2yuvEpDL9wQ=="
  crossorigin=""/>
<script src="https://unpkg.com/leaflet@1.6.0/dist/leaflet.js"
  integrity="sha512-gZwIG9x3wUXg2hdXF6+rVkLF/0Vi9U8D2Ntg4Ga5I5BZpVkVxlJWbSQtXPSiUTtC0TjtGOmxa1AJPuV0CPthew=="
  crossorigin=""></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet-gpx/1.7.0/gpx.min.js"></script>
```

地図はbody内のid=\"map\"属性で指定された要素に表示しますが、幅、高さをスタイルシートで指定します。

``` html
<style>
  #map {height: 300px; width: 100%;}
</style>
</head>
```

body内にid=\"map\"属性を持ったdiv要素を配置します。div要素にはスタイルシートでheightを指定しないと表示されないので注意です。

``` html
<div id="map" style="width:100%;height:360px"></div>
```

### JavaScriptで地図を表示する

上記のdiv要素より下にscriptタグで地図を表示させるためのJavaScriptコードを記述します。

まずはMapオブジェクトを作ります。

``` html
<script>
var map = L.map('map');
```

タイルレイヤに地理院タイルを指定し、mapオブジェクトに追加します。

``` html
L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png', {
      attribution: "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>"
}).addTo(map);
```

次にGPXファイルのデータを変数に代入します。GPXファイルはYamapやSTRAVAを始めとしたアプリやGPSロガーから取ってきます。今回はYamapで記録したログをダウンロードしました。

GPXファイルは、どこかにアップロードしてURLを指定してもよいのですが、Bloggerの場合はGPXファイルがアップロードできないのと、外部URLからの読み込みが許可されてないため、文字列としてそのままコードに貼付ける必要があります。複数行の文字列なのでバッククオート（\`）で囲みテンプレートリテラルとして記述します。下記は途中を省略した一部です。

``` html
var gpx = `<gpx ...
           <trkseg><trkpt lat="34.3642013" lon="135.8624252">
           <ele>359.27</ele><time>2021-11-14T02:36:40Z</time></trkpt>
           ... `;
```

GPXファイルをmapオブジェクトに追加します。オプションとしてスタート・ゴールのアイコン画像や線の外観を指定しています。

``` javascript
new L.GPX(gpx, {async: true,
  marker_options: {
      startIconUrl: 'images/pin-icon-start.png',
      endIconUrl: 'images/pin-icon-end.png',
      shadowUrl: 'images/pin-shadow.png'
  },
  polyline_options: {
      color: 'blue',
      opacity: 0.75,
      weight: 5,
      lineCap: 'round'
  }}).addTo(map);
```

いくつかマーカー（ピン）も追加します。

``` javascript
L.marker([34.36719144491052, 135.8619855041734],
       { title: '吉水神社' }).addTo(map);
L.marker([34.36841738029576, 135.85885910043802],
       { title: '金峯山寺蔵王堂' }).addTo(map);
L.marker([34.36794213347387, 135.85514232831662],
       { title: '脳天大神' }).addTo(map);
L.marker([34.36340231341314, 135.86120328236964],
       { title: '駐車場' }).addTo(map);
```

最後にmap.setViewで中心座標と縮尺を指定して地図を表示します。scriptタグを閉じて完成です。

``` javascript
  map.setView([34.3685, 135.86], 15);
</script>
```

下記が作成したマップです。等高線が入った国土地理院の地図にGPS軌跡とマーカーを配置できました。この地図はGoogleマップみたいにドラッグして中心を移動したり縮尺を変えたりすることができます。

下の地図にはマーカーをクリックするとポップアップが表示されますが、説明は割愛します。公式ホームページのドキュメントをご参照ください。

{{< leaflet json="track.json" center="{ \"lng\": 135.86, \"lat\": 34.3685 }" zoom="15" style="" >}}

## まとめ

JavaScriptを使うのが少し複雑ですが、コード自体はシンプルなのでそれほど大変では無かったです。登山記録を地図に表示する目的だとこれ一択ではないでしょうか！
