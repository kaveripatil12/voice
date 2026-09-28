package com.mitra.ai.tools

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import androidx.core.app.NotificationCompat

class AlarmReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val manager = context.getSystemService(NotificationManager::class.java)
        manager.createNotificationChannel(NotificationChannel("mitra", "Mitra reminders", NotificationManager.IMPORTANCE_HIGH))
        manager.notify(1001, NotificationCompat.Builder(context, "mitra").setSmallIcon(android.R.drawable.ic_lock_idle_alarm).setContentTitle("Mitra AI").setContentText(intent.getStringExtra("message")).setAutoCancel(true).build())
    }
}
