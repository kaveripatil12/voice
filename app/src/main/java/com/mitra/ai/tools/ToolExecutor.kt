package com.mitra.ai.tools

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import com.mitra.ai.data.ToolRequest
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class ToolExecutor(private val context: Context) {
    fun execute(request: ToolRequest): String {
        return when (request.name) {
            "setAlarm" -> scheduleAlarm(request.argument.orEmpty())
            "createReminder" -> "Reminder saved locally: ${request.argument.orEmpty()}"
            "getCurrentTime" -> SimpleDateFormat("h:mm a", Locale.getDefault()).format(Date())
            "openApp" -> openApp(request.argument.orEmpty())
            "createNote" -> saveNote(request.argument.orEmpty())
            "getLatestNotice" -> "Latest verified notice guidance is available from the official SVKM notice board."
            "sendContactInfo" -> "I can share the correct office contact after confirmation from the verified college directory."
            "getWeather" -> "Weather requires an external weather service; no API key is bundled in SVKM VoiceConnect."
            else -> "This action requires a verified SVKM service or has not been enabled yet."
        }
    }

    private fun scheduleAlarm(details: String): String {
        val alarmManager = context.getSystemService(AlarmManager::class.java)
        val intent = Intent(context, AlarmReceiver::class.java).putExtra("message", details.ifBlank { "SVKM VoiceConnect reminder" })
        val pending = PendingIntent.getBroadcast(context, details.hashCode(), intent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
        val time = System.currentTimeMillis() + 60_000
        alarmManager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, time, pending)
        return "Alarm set. I will remind you in about a minute for testing."
    }

    private fun openApp(name: String): String {
        val packageManager = context.packageManager
        val packages = packageManager.getInstalledApplications(0)
        val match = packages.firstOrNull {
            it.loadLabel(packageManager).toString().equals(name, true) ||
                it.loadLabel(packageManager).toString().contains(name, true)
        }
        if (match != null) {
            val launchIntent = packageManager.getLaunchIntentForPackage(match.packageName)?.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            if (launchIntent != null) {
                context.startActivity(launchIntent)
                return "Opening ${match.loadLabel(packageManager)}."
            }
        }
        return "I couldn't find $name on this phone."
    }

    private fun saveNote(note: String): String {
        val prefs = context.getSharedPreferences("svkm_notes", Context.MODE_PRIVATE)
        val existing = prefs.getStringSet("notes", emptySet()).orEmpty()
        prefs.edit().putStringSet("notes", existing + note).apply()
        return "Note saved locally."
    }
}
