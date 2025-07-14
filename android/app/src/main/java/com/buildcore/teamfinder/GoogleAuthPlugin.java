package com.buildcore.teamfinder;

import android.app.Activity;
import android.util.Log;
import androidx.credentials.CredentialManager;
import androidx.credentials.CredentialManagerCallback;
import androidx.credentials.GetCredentialRequest;
import androidx.credentials.GetCredentialResponse;
import androidx.credentials.exceptions.GetCredentialException;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.JSObject;
import com.getcapacitor.PluginMethod;
import com.google.android.libraries.identity.googleid.GetGoogleIdOption;
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential;

@CapacitorPlugin(name = "GoogleAuthPlugin")
public class GoogleAuthPlugin extends Plugin {
    private static final String TAG = "GoogleAuthPlugin";
    private PluginCall savedCall;

    @PluginMethod
    public void signInWithGoogle(PluginCall call) {
        savedCall = call;
        Activity activity = getActivity();
        Log.d(TAG, "Starting Google sign-in with Credential Manager");
        CredentialManager credentialManager = CredentialManager.create(activity);
        GetGoogleIdOption googleIdOption = new GetGoogleIdOption.Builder()
            .setServerClientId("121079668689-mhp6gmg1r8pdb41lcmqmfncv4vh3u0ho.apps.googleusercontent.com") // Web Client ID
            .build();
        GetCredentialRequest request = new GetCredentialRequest.Builder()
            .addCredentialOption(googleIdOption)
            .build();
        credentialManager.getCredentialAsync(
            activity,
            request,
            null, // No cancellation signal
            activity.getMainExecutor(),
            new CredentialManagerCallback<GetCredentialResponse, GetCredentialException>() {
                @Override
                public void onResult(GetCredentialResponse response) {
                    try {
                        Object credential = response.getCredential();
                        if (credential instanceof GoogleIdTokenCredential) {
                            String idToken = ((GoogleIdTokenCredential) credential).getIdToken();
                            Log.d(TAG, "Google ID token received: " + (idToken != null ? idToken.substring(0, Math.min(20, idToken.length())) + "..." : "null"));
                            JSObject ret = new JSObject();
                            ret.put("idToken", idToken);
                            savedCall.resolve(ret);
                        } else {
                            Log.e(TAG, "No Google ID token found in credential");
                            savedCall.reject("No Google ID token found");
                        }
                    } catch (Exception e) {
                        Log.e(TAG, "Google sign-in failed: " + e.getMessage(), e);
                        savedCall.reject("Google sign-in failed: " + e.getMessage());
                    }
                }
                @Override
                public void onError(GetCredentialException e) {
                    Log.e(TAG, "Google sign-in failed: " + e.getMessage(), e);
                    savedCall.reject("Google sign-in failed: " + e.getMessage());
                }
            }
        );
    }
} 