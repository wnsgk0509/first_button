package com.first_button_app

import android.app.AlarmManager
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import java.util.Calendar

class JamkkanAlarmReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val prefs = context.getSharedPreferences("jamkkan_prefs", Context.MODE_PRIVATE)
        val isAlarmEnabled = prefs.getBoolean("alarm_enabled", false)

        if (intent.action == Intent.ACTION_BOOT_COMPLETED) {
            if (isAlarmEnabled) {
                val hour = prefs.getInt("alarm_hour", 7)
                val minute = prefs.getInt("alarm_minute", 0)
                scheduleNextDailyAlarm(context, hour, minute)
            }
            return
        }

        // Show lock screen interrupt notification
        showInterruptNotification(context)

        // Schedule next day
        if (isAlarmEnabled) {
            val hour = prefs.getInt("alarm_hour", 7)
            val minute = prefs.getInt("alarm_minute", 0)
            scheduleNextDailyAlarm(context, hour, minute)
        }
    }

    private fun showInterruptNotification(context: Context) {
        val notificationManager =
            context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        val channelId = "jamkkan_daily_channel"
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                "잠깐 - 하루 한 질문 알림",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "설정한 시간에 오늘의 성찰 질문을 잠금화면과 상단에 전달합니다."
                enableVibration(true)
                lockscreenVisibility = NotificationCompat.VISIBILITY_PUBLIC
            }
            notificationManager.createNotificationChannel(channel)
        }

        val prefs = context.getSharedPreferences("jamkkan_prefs", Context.MODE_PRIVATE)
        val question = prefs.getString(
            "today_question",
            "지금 이 순간 핸드폰을 집어 들기 전에, 무엇을 하려 했나요?"
        ) ?: "지금 이 순간 핸드폰을 집어 들기 전에, 무엇을 하려 했나요?"

        val openAppIntent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            putExtra("from_notification", true)
        }

        val pendingIntent = PendingIntent.getActivity(
            context,
            1001,
            openAppIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(context, channelId)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle("🌿 잠깐, 핸드폰을 켜셨나요?")
            .setContentText(question)
            .setStyle(NotificationCompat.BigTextStyle().bigText(question))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .build()

        notificationManager.notify(2026, notification)
    }

    companion object {
        fun scheduleNextDailyAlarm(context: Context, hour: numberInt, minute: numberInt) {
            val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            val intent = Intent(context, JamkkanAlarmReceiver::class.java).apply {
                action = "com.first_button_app.ACTION_DAILY_INTERRUPT"
            }
            val pendingIntent = PendingIntent.getBroadcast(
                context,
                2002,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            val calendar = Calendar.getInstance().apply {
                timeInMillis = System.currentTimeMillis()
                set(Calendar.HOUR_OF_DAY, hour)
                set(Calendar.MINUTE, minute)
                set(Calendar.SECOND, 0)
                set(Calendar.MILLISECOND, 0)
            }

            if (calendar.timeInMillis <= System.currentTimeMillis()) {
                calendar.add(Calendar.DAY_OF_YEAR, 1)
            }

            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    alarmManager.setExactAndAllowWhileIdle(
                        AlarmManager.RTC_WAKEUP,
                        calendar.timeInMillis,
                        pendingIntent
                    )
                } else {
                    alarmManager.setExact(
                        AlarmManager.RTC_WAKEUP,
                        calendar.timeInMillis,
                        pendingIntent
                    )
                }
            } catch (e: SecurityException) {
                alarmManager.set(
                    AlarmManager.RTC_WAKEUP,
                    calendar.timeInMillis,
                    pendingIntent
                )
            }
        }

        fun cancelAlarm(context: Context) {
            val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            val intent = Intent(context, JamkkanAlarmReceiver::class.java).apply {
                action = "com.first_button_app.ACTION_DAILY_INTERRUPT"
            }
            val pendingIntent = PendingIntent.getBroadcast(
                context,
                2002,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            alarmManager.cancel(pendingIntent)
        }
    }
}
typealias numberInt = Int
