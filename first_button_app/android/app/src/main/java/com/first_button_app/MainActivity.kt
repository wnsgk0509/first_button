package com.first_button_app

import android.os.Build
import android.os.Bundle
import android.view.View
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  override fun getMainComponentName(): String = "first_button_app"

  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    hideSystemNavigationBar()
  }

  override fun onWindowFocusChanged(hasFocus: Boolean) {
    super.onWindowFocusChanged(hasFocus)
    if (hasFocus) {
      hideSystemNavigationBar()
    }
  }

  private fun hideSystemNavigationBar() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
      val insetsController = WindowCompat.getInsetsController(window, window.decorView)
      insetsController.systemBarsBehavior =
          WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
      insetsController.hide(WindowInsetsCompat.Type.navigationBars())
    } else {
      @Suppress("DEPRECATION")
      window.decorView.systemUiVisibility = (
          View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
          or View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
      )
    }
  }
}
