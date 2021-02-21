"use strict";

var twpConfig = {}

{
    let observers = []
    let onReadyObservers = []
    let config = null
    const defaultConfig = {
        pageTranslatorService: "google",
        targetLanguages: [], // "en", "es", "de"
        showTranslatePageContextMenu: true,
        showTranslateSelectedContextMenu: true,
        showOriginalTextWhenHovering: true,
        showTranslateSelectedButton: true,
        darkMode: "auto",
        showReleaseNotes: true,
    }

    twpConfig.onReady = function (callback) {
        if (config) {
            callback()
        } else {
            onReadyObservers.push(callback)
        }
    }

    twpConfig.get = function (name) {
        if (typeof config[name] !== "undefined") {
            return config[name]
        }
    }

    twpConfig.set = function (name, value) {
        config[name] = value
        const obj = {}
        obj[name] = value
        chrome.storage.local.set(obj)
    }

    twpConfig.onChanged = function(callback) {
        observers.push(callback)
    }

    chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === "local") {
            for (const name in changes) {
                const newValue = changes[name].newValue
                if (config[name] !== newValue) {
                    config[name] = newValue
                    observers.forEach(callback => callback(name, newValue))
                }
            }
        }
    })

    chrome.i18n.getAcceptLanguages(acceptedLanguages => {
        chrome.storage.local.get(null, onGot => {
            config = {}
    
            for (const name in defaultConfig) {
                config[name] = defaultConfig[name]
            }

            for (let lang of acceptedLanguages) {
                lang = checkLanguageCode(fixLanguageCode(lang))
                if (lang && config.targetLanguages.indexOf(lang) === -1) {
                    config.targetLanguages.push(lang)
                }
                if (config.targetLanguages.length >= 3) {
                    break
                }
            }

            const defaultTargetLanguages = ["en", "es", "de"]
            for (const idx in defaultTargetLanguages) {
                if (config.targetLanguages.length >= 3) break;
                if (config.targetLanguages.indexOf(defaultTargetLanguages[idx]) === -1) {
                    config.targetLanguages.push(defaultTargetLanguages[idx])
                }
            }
    
            for (const name in onGot) {
                config[name] = onGot[name]
            }
            
            onReadyObservers.forEach(callback => callback())
            onReadyObservers = []
        })
    })
}