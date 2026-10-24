package com.first_button_app

import android.content.Context
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class JamkkanBridgeModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "JamkkanBridge"

    @ReactMethod
    fun updateWidgetData(question: String, dateText: String, promise: Promise) {
        try {
            val prefs = reactContext.getSharedPreferences("jamkkan_prefs", Context.MODE_PRIVATE)
            prefs.edit()
                .putString("today_question", question)
                .putString("today_date", dateText)
                .apply()

            JamkkanWidgetProvider.updateAllWidgets(reactContext)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERR_WIDGET", e.message)
        }
    }

    @ReactMethod
    fun setDailyAlarm(hour: Int, minute: Int, question: String, promise: Promise) {
        try {
            val prefs = reactContext.getSharedPreferences("jamkkan_prefs", Context.MODE_PRIVATE)
            prefs.edit()
                .putBoolean("alarm_enabled", true)
                .putInt("alarm_hour", hour)
                .putInt("alarm_minute", minute)
                .putString("today_question", question)
                .apply()

            JamkkanAlarmReceiver.scheduleNextDailyAlarm(reactContext, hour, minute)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERR_ALARM", e.message)
        }
    }

    @ReactMethod
    fun cancelDailyAlarm(promise: Promise) {
        try {
            val prefs = reactContext.getSharedPreferences("jamkkan_prefs", Context.MODE_PRIVATE)
            prefs.edit()
                .putBoolean("alarm_enabled", false)
                .apply()

            JamkkanAlarmReceiver.cancelAlarm(reactContext)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERR_CANCEL_ALARM", e.message)
        }
    }

    @ReactMethod
    fun getAlarmSettings(promise: Promise) {
        try {
            val prefs = reactContext.getSharedPreferences("jamkkan_prefs", Context.MODE_PRIVATE)
            val enabled = prefs.getBoolean("alarm_enabled", false)
            val hour = prefs.getInt("alarm_hour", 7)
            val minute = prefs.getInt("alarm_minute", 0)

            val map = Arguments.createMap().apply {
                putBoolean("enabled", enabled)
                putInt("hour", hour)
                putInt("minute", minute)
            }
            promise.resolve(map)
        } catch (e: Exception) {
            promise.reject("ERR_GET_SETTINGS", e.message)
        }
    }
}
