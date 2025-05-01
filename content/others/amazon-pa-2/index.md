---
categories:
  - ブログ
date: "2025-02-15T23:44:20+09:00"
description: AmazonアソシエイトのPA-API Python SDKを使い商品リンクを作成する方法を解説します。
draft: false
images:
  - images/pa-api2.png
summary: AmazonアソシエイトのPA-API Python SDKを使い商品リンクを作成する方法を解説します。
tags:
  - Amazonアソシエイト
  - PA-API
  - Webサービス
title: アソシエイトのツールバーで作成した画像＋テキストリンクをPA-APIを使い変換する
js: js/paad.ts
---

![title-image](./images/pa-api2.webp)

アソシエイトツールバーで作成した「画像リンク」、「テキストと画像リンク」が廃止され、とりあえずスクラッチパッドでASINを入れてHTMLを取得する方法を試してみました。

しかしさすがにこれまで作成したリンク一つ一つからASINを抜き出しスクラッチパッドに入れるのは骨がおれるため、PythonのSDKを使い既存のリンクからASINを抜き出し、PA-APIから画像とURLを取得してHTMLを吐き出すまでのスクリプトを書いてみました。

## PA-API(商品情報API)とは

PA-API(商品情報API)とは、アマゾンに掲載されている商品の名称、URL、画像、価格など様々な情報を取得できるAPIです。使用するには認証キーの取得が必要なこと、アマゾンアソシエイトで一定の売上をあげている必要があります。認証キーの取得、スクラッチパッドの基本的な使い方は
[前回の記事](/others/amazon-pa-1 "アマゾンアソシエイト アソシエイトツールバー画像リンク作成機能の廃止")
をご参考ください。

{{< linkcard "/others/amazon-pa-1" >}}

## 動作環境とPythonのライブラリ

Linux(Ubuntu)にPython3.11.6です。WindowsでもMacOSでもおそらくそのままかほぼそのまま動作するのではと思います。

HTMLの解析のためにBeautifulSoupを使っているため、BeautifulSoupが必要です。その他はPA-APIのSDKと標準ライブラリのみ使っています。

```sh
$ pip install beautifulsoup4
```

## SDKのダウンロード

[PA-API開発者ガイドのページ](https://webservices.amazon.com/paapi5/documentation/quick-start/using-sdk.html "PA-API開発者ガイド")
からダウンロードします。PHP、Java、Node.js、PythonのSDKが公開されています。今回はPyhonのSDKをダウンロードしました。SDKにはサンプルコードも含まれています。

以下、APIのバージョンは2024年1月4日時点の5.0を前提に解説していきます。

## 必要な情報

認証キー(アクセスキー、シークレットキー)、アソシエイトIDが必要です。また、ASINをもとに商品情報を取得しますが、これは以前にアソシエイトツールバーで作成したHTMLタグをクリップボードにコピーして、クリップボードからASINを読み取るようにします。

## サンプルコードを確認

ダウンロードした ` paapi5-python-sdk-example.zip ` を解凍してみます。
` __MACOSX ` と、 ` paapi5-python-sdk-example `
という2つのディレクトリができました。Linuxなので ` __MACOSX `
は無視するとして、 ` paapi5-python-sdk-example `
の中にはいろいろ入っていますが、今回直接使うのは、
` sample_get_items_api.py ` です。

```sh
.
├── __MACOSX
│   └── paapi5-python-sdk-example
├── paapi5-python-sdk-example
│   ├── COPYING.txt
│   ├── LICENSE.txt
│   ├── NOTICE.txt
│   ├── README.md
│   ├── paapi5_python_sdk/
│   ├── requirements.txt
│   ├── sample_get_browse_nodes_api.py
│   ├── sample_get_items_api.py ←これを使う
│   ├── sample_get_variations_api.py
│   ├── sample_request_with_conn_pool_settings.py
│   ├── sample_search_items_api.py
│   ├── setup.cfg
│   ├── setup.py
│   ├── test/
│   ├── test-requirements.txt
│   └── tox.ini
└── paapi5-python-sdk-example.zip
```

` sample_get_items_api.py ` の中の ` get_items() `
関数を使えば商品情報を取得できそうです。サンプルコードは、少し修正しました。

```python
def get_items(akey, skey, ptag, asin):  #① 引数追加。オリジナルは引数なし get_items()
    """ Following are your credentials """
    """ Please add your access key here """
    access_key = akey #①

    """ Please add your secret key here """
    secret_key = skey #①

    """ Please add your partner tag (store/tracking id) here """
    partner_tag = ptag #①

    """ PAAPI host and region to which you want to send request """
    """ For more details refer: https://webservices.amazon.com/paapi5/documentation/common-request-parameters.html#host-and-region"""
    host = "webservices.amazon.co.jp" #② webservices.amazon.comから日本(co.jp)に変更
    region = "us-wast-2" #③us-east-1から変更

    """ API declaration """
    default_api = DefaultApi(
        access_key=access_key, secret_key=secret_key, host=host, region=region
    )

    """ Request initialization"""

    """ Choose item id(s) """
    item_ids = [asin] #①
    
    ########    省略    ########
    
    """ Forming request """

    try:
        get_items_request = GetItemsRequest(
            partner_tag=partner_tag,
            partner_type=PartnerType.ASSOCIATES,
            marketplace="www.amazon.co.jp", #② webservices.amazon.comから日本(co.jp)に変更
            condition=Condition.NEW,
            item_ids=item_ids,
            resources=get_items_resource,
        )

    ########    省略    ########

    return response.items_result    except Exception as exception:
            print("Exception :", exception, file=sys.stderr)
    #                                       ~~~~~~~~~~~~~~~ ④printが多くうるさいのでstderrに出力
    
    return response.items_result # ⑤戻り値を追加

########    ファイル最後の関数呼び出しはコメントアウト    ########
# get_items()
# get_items_with_http_info()
# get_items_async()
    
    
```

1.  関数の中にアクセスキーなどの認証情報を直接書き込むようになっているため、引数で渡すように変更しました。
2.  問い合わせ先がアメリカのアマゾン(amazon.com)になっていたのでamazon.co.jpに変更。
3.  reagionも変更必要です。日本はなぜかus-wast-2になるようです。
4.  途中、printで標準出力に色々書き出すようになっていましたが、最終的に整形したHTMLのみ出力したいので力技ですが、すべてのprint文に標準エラー出力に書き出すように変更。(sysモジュールのインポート必要です)
5.  取得した情報は ` response.items_result `
    に入っていそうです。別の関数から戻り値を使いたいので ` return `
    文を最後に追加しました。

## 既存のリンクをクリップボードから読み、HTMLを出力するスクリプト

既存のリンクは、 ` iframe ` タグの ` src ` 属性の中に
` asins=********** ` という形でASINが埋め込まれています。

```html
<iframe frameborder="0" height="240" marginheight="0" marginwidth="0" sandbox="allow-popups allow-scripts allow-modals allow-forms allow-same-origin" scrolling="no"
  src="//rcm-fe.amazon-adsystem.com/e/cm?lt1=_blank&amp;bc1=000000&amp;IS2=1&amp;bg1=FFFFFF&amp;fc1=000000&amp;lc1=0000FF&amp;t=アソシエイトID&amp;language=ja_JP&amp;o=9&amp;p=8&amp;l=as4&amp;m=amazon&amp;f=ifr&amp;ref=as_ss_li_til&amp;asins=B005RFSIUW&amp;linkId=f741756446a26bffc9ce95581b04542f" style="width:120px;height:240px;" title="アマゾン 絶縁ナットドライバー" width="120"></iframe>
```

標準入力から ` iframe ` タグを読み込み、ASINを取り出し、先程の
` get_items `
で商品情報を取得、商品情報、URL、画像のURLをHTMLテンプレートに流し込み標準出力に出す感じです。
` iframe `
タグを複数続けて設置していることもあるため、複数タグを選択しても動くようにしました。

` iframe `
タグ無しでも、ASINを指定して同じHTMLを出せるようにコマンドラインオプション無しだと標準入力から読み込み、
` -a --asin ` オプションでASINを指定するオプションも付けました。

```python
import get_items_api as paap
from bs4 import BeautifulSoup
import re
import json
import sys
import argparse

### Amazon associates credidentials
access_key = "アクセスキー"
secret_key = "シークレットキー"
partner_tag = "アソシエイトID"

### 雛形
# {0} アソシエイトID
# {1} URL
# {2} タイトル
# {3} イメージURL
template = """\
<div class="paapi5-pa-ad-unit"><div class="paapi5-pa-product-container"><div class="paapi5-pa-product-image"><div class="paapi5-pa-product-image-wrapper"><a class="paapi5-pa-product-image-link" href="{1}" title="{2}" target="_blank"><img class="paapi5-pa-product-image-source" src="{3}" alt="{2}" width={4} height={5}></a></div></div><div class="paapi5-pa-product-details"><div class="paapi5-pa-product-title"><a class="paap5-pa-product-title-link" href="{1}" title="{2}" target="_blank">{2}</a></div><div class="paapi5-pa-product-list-price"><span class="paapi5-pa-product-list-price-value"></span></div><div class="paapi5-pa-product-prime-icon"><span class="icon-prime-all"></span><a class="paap5-pa-product-title-link" href="{1}" title="{2}" target="_blank"><span class="buy-on-amazon">Amazonで買う</span></a></div></div></div></div>\
"""

### 認証情報とASINを受取り、HTMLを返す関数
def create_html(access_key, secret_key, partner_tag, asin, template):
    response = paap.get_items(access_key, secret_key, partner_tag, asin)
    url = response.items[0].detail_page_url
    title = response.items[0].item_info.title.display_value
    img = response.items[0].images.primary.medium
    print(template.format(partner_tag, url, title, img.url, img.width, img.height))

### コマンドラインオプション
parser = argparse.ArgumentParser()
parser.add_argument("-a", "--asin", help="与えられたASINに対するHTMLを返す", action="store")
args = parser.parse_args()
if args.asin:
    asin = args.asin
    print("found asin: {0}".format(asin), file=sys.stderr)
    create_html(access_key, secret_key, partner_tag, asin, template)
else:
    soup = BeautifulSoup(sys.stdin.read(), "lxml")
    asin_tags = soup.find_all("iframe", src=re.compile("asin"))
    for asin_tag in asin_tags:
        m = re.search(r"asins=(\w+)", str(asin_tag["src"]))
        asin = m.group(1)
        print("found asin: {0}".format(asin), file=sys.stderr)
        create_html(access_key, secret_key, partner_tag, asin, template)
```

プログラマーでは無いので拙いコードですが、とりあえず即席でなんとか動かすことができました。書いてみてBeautifulSoupを使うほどでもなく、単なる文字列置換でよかった気もします。また、
` sample_get_items_api.py ` の中の ` get_items() ` 関数は途中でいろいろ
` print `
するのでこのあたりは削除して書き直したほうがよかったかもしれません。

## 使い方

### 既存のテキストと画像タグの置き換え

` iframe `
タグ全体を（あっても可）選択し、クリップボードにコピーします。

` xsel `
でクリップボードの内容をパイプでこのスクリプトに渡します。標準エラー出力は表示しないようにして、端末の標準出力に出てきたHTMLタグをコピーしてブログに貼り付ける使い方です。

```sh
$ xsel -bo | python3 create_link.py 2>/dev/null 
```

### ASINからHTMLタグを生成

```sh
$ python3 create_link.py -a ASIN番号 2>/dev/null
```

### 出力されたHTML

スクラッチパッドのHTMLを参考にしました。やたらと ` div `
タグにラップされていていちいち長いクラス名が付いていてもっとスッキリさせたいですが、同じくスクラッチパッドで出力されたCSSもほぼそのままで使いたいので、面倒なのでスクラッチパッドとほぼ同じにしています。

```html
<div class="paapi5-pa-ad-unit"><div class="paapi5-pa-product-container"><div class="paapi5-pa-product-image"><div class="paapi5-pa-product-image-wrapper"><a class="paapi5-pa-product-image-link" href="https://www.amazon.co.jp/dp/B005RFSIUW?tag=アソシエイトID&linkCode=ogi&th=1&psc=1" title="クニペックス KNIPEX 9803-10 絶縁ナットドライバー 1000V" target="_blank"><img class="paapi5-pa-product-image-source" src="https://m.media-amazon.com/images/I/31QfMSIO87L._SL160_.jpg" alt="クニペックス KNIPEX 9803-10 絶縁ナットドライバー 1000V" width=160 height=160></a></div></div><div class="paapi5-pa-product-details"><div class="paapi5-pa-product-title"><a class="paap5-pa-product-title-link" href="https://www.amazon.co.jp/dp/B005RFSIUW?tag=アソシエイトID&linkCode=ogi&th=1&psc=1" title="クニペックス KNIPEX 9803-10 絶縁ナットドライバー 1000V" target="_blank">クニペックス KNIPEX 9803-10 絶縁ナットドライバー 1000V</a></div><div class="paapi5-pa-product-list-price"><span class="paapi5-pa-product-list-price-value"></span></div><div class="paapi5-pa-product-prime-icon"><span class="icon-prime-all"></span><a class="paap5-pa-product-title-link" href="https://www.amazon.co.jp/dp/B005RFSIUW?tag=アソシエイトID&linkCode=ogi&th=1&psc=1" title="クニペックス KNIPEX 9803-10 絶縁ナットドライバー 1000V" target="_blank"><span class="buy-on-amazon">Amazonで買う</span></a></div></div></div></div>
```

CSSもScratchpadで出力されたものをそのままコピペでもいいですが、今回は少しカスタマイズしてみました。


## 作成したリンク

こんな感じです。

{{< pa "B09QQ17L4V" >}}

## Bloggerでは手動埋め込みしかできなさそう

さて、ここまでできたらレンタルサーバーを使っている場合などはアクセスの度にPA-APIを叩いてリンクを生成すればよいのですが、Bloggerなど、サーバーでの処理が使えない環境では作成したリンクをコピペ手動で貼り付ける必要があります。

アマゾンアソシエイトPA-APIの規約を読むと、結果をキャッシュする場合、24時間以内にAPIから情報を更新すること、価格情報は1時間以内に更新すること、と書かれているためこれを永久的に貼り付けておくのは微妙です。

特に価格情報は頻繁に変わるので作成したリンクには載せないようにしました。商品へのURLは、アソシエイトツールバーのテキストリンクと同じものが帰ってきてるようで、アソシエイトツールバーのテキストリンクはコピペで更新しなくても良いため問題無いのでは、と思っています。

画像は微妙ですが、リンク先のURLを見ると頻繁に更新されるようなものでは無さそうなので画像も入れて様子見してみます。

Javascriptのfetchでクライアント側から取得すればよいのでは！？と思いやってみましたが、同一オリジンポリシーとかいうのがあってダメみたいです。Netlify functions (FaaS)を使い、動的に商品情報を取得する方法にも挑戦してみました。詳細は、下の関連記事を参照ください。

## まとめ

SDKを使うことで動かなくなったアマゾンアソシエイトツールバーで作成した「テキストと画像リンク」をPA-APIで取得したリンクに変換することができました。

結局1個1個手動でタグを置き換える必要がありますが、SDKを使ったスクリプトを書くことで作業自体はだいぶ楽になりました。
