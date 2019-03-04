const cheerio = require('cheerio')

module.exports = function (source) {
    const $ = cheerio.load(source, {
        decodeEntities: false
    })

    /** 將所有唯一名稱的「_my-id」轉譯成「:id="$style.my-id"」 */
    $('[id^="_"]').each(function (i, elem) {
        /** 取得唯一名稱並移除開頭的底線 */
        var id = $(this).attr('id').substr(1)

        /** 加上 Vue.js 的唯一名稱標籤 */
        $(this).attr(':id', `$style['${id}']`)
        $(this).removeAttr('id')

        /** 以 HTML 註釋包覆住該元素 */
        /** https://github.com/vuejs/vue/issues/6177#issuecomment-316886075 */
        // $(this).after(`<!-- / ${id} -->`)
        // $(this).before(`<!-- ${id} -->`)
    });

    /** 將所有樣式類別名稱的「_my-class」轉譯成「:="$style.my-class"」 */
    $('[class*="_"]').each(function (i, elem) {
        /** 取得現有的 Vue.js 動態樣式類別，初始化其資料型態 */
        var moduleClass = $(this).attr(':class')
        var moduleClassType = null

        /** 如果已經有現有的動態樣式類別，那麼就取得其資料型態並移除前後輟符號 */
        if (moduleClass !== undefined) {
            switch (moduleClass[0]) {
                case '{':
                    moduleClassType = 'object'
                    moduleClass = moduleClass.replace(/(^\{)|(\}$)/g, '')
                    break
                case '[':
                    moduleClassType = 'array'
                    moduleClass = moduleClass.replace(/(^\[)|(\]$)/g, "")
                    break
            }
            moduleClass = moduleClass.split(',')
        } else {
            moduleClass = []
        }

        /** 取得元素本身的所有樣式類別名稱，並遞迴 */
        var classes = $(this).attr('class').split(' ')
        for (var className of classes) {
            /** 如果這個樣式類別名稱沒有底線，那麼就不是我們需要處理的 */
            if (className[0] !== '_') {
                continue
            }
            /** 定義這個樣式類別去除開頭底線的真實名稱 */
            var realName = className.substr(1)
            /** 依照現有的 Vue.js 動態樣式類別來決定將普通樣式推入時應該用哪種格式 */
            switch (moduleClassType) {
                case 'object':
                    moduleClass.push(`[$style['${realName}']]:true`)
                    break
                case 'array':
                default:
                    moduleClass.push(`$style['${realName}']`)
                    break
            }
            /** 從一般的樣式類別清單上移除原本的類別 */
            $(this).removeClass(className)
        }

        /** 最後依照現有的 Vue.js 動態樣式類別資料型態格式決定該怎麼取代動態樣式內容 */
        switch (moduleClassType) {
            case 'object':
                $(this).attr(':class', `{${moduleClass.join(',')}}`)
                break
            case 'array':
            default:
                $(this).attr(':class', `[${moduleClass.join(',')}]`)
                break
            //default:
            //    $(this).attr(':class', `${moduleClass.join(',')}`)
            //    break
        }
    });

    return $('body').html()
}