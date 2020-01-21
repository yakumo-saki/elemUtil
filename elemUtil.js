"use strict";

// 

const $elemUtil = {

    /**
     * $from から $to に値を転記する
     * $from.find("[name=fromname]").val() を $to.find("[name=toname]).val() にセット。
     * 使用例 copyValue($('#nounyuForm'), $('#kensakuForm'), "tksName") => #nounyuForm.tksNameを#kensakuForm.tksFormにコピー)
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
        this._isValid($from, "from" ,true);
        this._isValid($to, "to", !allowMultipleTo); // 複数コピられるのを許すなら false なのでひっくり返す

        $to.each(function(idx, el) {
            this._doCopy($from, $(el));
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
     * checkbox -> checkbox コピー.
     * @param $from
     * @param $to
     * @private
     */
    _copyCheckbox($from, $to) {
        $to.prop("checked", $from.prop("checked"));
    },
    /**
     * コピーを実際に行う.
     * @param $from
     * @param $to
     * @private
     */
    _doCopy($from, $to) {
        if ($from.is(":checkbox") && $to.is(":checkbox")) {
            this._copyCheckbox($from, $to);
        } else if (this._isValType($from) && $to.is(":checkbox")) {
            const value = $from.val();
            if (value == 1 || value == -1) { // === でないのは意図的
                $to.prop("checked", true);
            } else {
                $to.prop("checked", false);
            }
        } else if (this._isValType($from) && this._isValType($to)) {
            $to.val($from.val());
        } else {
            throw new Error("非対応の組み合わせ " + $from.prop("type") + " => " + $to.prop("type"));
        }
    }
};
