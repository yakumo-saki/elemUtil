"use strict";
const $elemUtil = {

    /**
     * $from から $to に値を転記する
     * $from.find("[name=fromname]").val() を $to.find("[name=toname]).val() にセット。
     * 使用例 copyValue($('#fromForm'), $('#toForm'), "name") => #fromForm.name を #toForm.name にコピー)
     *
     * @param $fromParent コピー元起点jQueryオブジェクト。fromNameを検索する起点になるもの formを想定
     * @param $toParent コピー先起点jQueryオブジェクト。toNameを検索する起点になるもの formを想定
     * @param fromName コピー元 name
     * @param toName [省略可能]コピー先 name。省略時は fromName と同じと見なす
     * @param allowMultipleTo [省略可能] コピー先 name が複数要素あった時にエラーとする(false、デフォルト） or 全てに書込(true)
     */
    copy: function ($fromParent, $toParent, fromName, toName, allowMultipleTo = false) {

        if ($fromParent.length !== 1) {
            throw new Error("$fromParentがlength=1ではない " + $fromParent.length);
        } else if ($toParent.length !== 1) {
            throw new Error("$toParentがlength=1ではない " + $toParent.length);
        }

        const $from = $fromParent.find("[name=" + fromName + "]");
        const realToName = (toName == null) ? fromName : toName;
        const $to = $toParent.find("[name=" + realToName + "]");

        // from to の前提条件チェック
        this._isValid($from, "[copy from]" ,true);
        this._isValid($to, "[copy to]", !allowMultipleTo); // 複数コピられるのを許すなら false なのでひっくり返す

        $to.each(function(idx, el) {
            this._doCopy($from, $(el));
        });
    },
    /**
     * $toParent[name=toName] に値をセットします.
     * @param value セットする値。 コピー先がcheckboxの場合など変換される場合がある
     * @param $toParent コピー先jQueryオブジェクト。toNameを検索する起点になるもの formを想定
     * @param toName コピー先 name
     * @param allowMultipleTo [省略可能] コピー先 name が複数要素あった時にエラーとする(false、デフォルト） or 全てに書込(true)
     */
    setValue(value, $toParent, toName, allowMultipleTo = false) {
        const $to = $toParent.find("[name=" + toName + "]");
        this._isValid($to, "[setValue to]", !allowMultipleTo); // 複数コピられるのを許すなら false なのでひっくり返す

        $to.each(function(idx, el) {
            this._setValue(value, $(el));
        });
    },
    /**
     * 要素のチェック
     * @param $elem コピー元
     * @param elemName  例外メッセージ用の識別できる名前
     * @param noLengthCheck length == 1 をチェックするか
     * @private
     */
    _isValid: function($elem, elemName, noLengthCheck) {
        const NG_TYPES = ["radio", "button", "file", "submit", "image"];

        if (noLengthCheck && $elem.length !== 1) {
            throw new Error(elemName + "の要素が1つではなく複数存在した。");
        } else if (NG_TYPES.indexOf($elem.prop("type")) >= 0) {
            throw new Error(elemName + "の要素が非対応" + $elem.attr("type"));
        }

        return true;
    },
    /**
     * val() で取得できるタイプか。 val()で取れるなら val() でセットできる
     * 例えば、checkboxはval()　では取れない
     * @param $elem
     * @return {boolean} 判定結果。 true = yes
     * @private
     */
    _isValType: function($elem) {
        // typeなしの場合、text扱いされる。必ず小文字で返ってくる
        const TYPES = ["text", "hidden", "select", "url", "email", "tel"];
        if (TYPES.indexOf($elem.prop("type")) >= 0) {
            return true;
        } else if ($elem.is("select")) {
            return true;
        }

        return false;
    },
    /**
     * 値を読込み、書込先にセット。必要に応じて値の変換を行う.
     * @param $from
     * @param $to
     * @private
     */
    _doCopy($from, $to) {
        if ($from.is(":checkbox") && $to.is(":checkbox")) {
            this._setValue($from.prop("checked", $to));
        } else if (this._isValType($from) && $to.is(":checkbox")) {
            this._setValue(this._valueToCheckbox($from.val()), $to);
        } else if (this._isValType($from) && this._isValType($to)) {
            $to.val($from.val());
        } else {
            throw new Error("非対応の組み合わせ " + $from.prop("type") + " => " + $to.prop("type"));
        }
    },
    /**
     * 指定の値を $to に応じてセットする.
     * @param value セットする値（不適切な場合は例外を投げる）
     * @param $to セットする要素
     * @private
     */
    _setValue(value, $to) {
        if ($to.is(":checkbox")) {
            if (value === true || value === false) {
                $to.prop("checked", value);
            } else {
                throw new Error("[BUG] checkboxに書込するのに値が不正 => " + value);
            }
        } else if (this._isValType($to)) {
            $to.val(value);
        } else {
            throw new Error("非対応の書込先type => " + $to.prop("type"));
        }
    },
    /**
     * 指定された値をチェックボックスに反映する際の変換.
     * @param val
     * @private
     */
    _valueToCheckbox(val) {
        const v = String(val).toLowerCase();
        if (v === "1" || v === "-1" || v === "true" || v === "yes" || v === "on") { // === でないのは意図的
            return true;
        } else {
            return false;
        }
    }
};
