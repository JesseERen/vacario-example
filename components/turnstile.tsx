import React from 'react'
import { View } from 'react-native'
import { WebView } from 'react-native-webview'

/**
 * Provides an implementation of Cloudflare Turnstile (a CAPTCHA service)
 */
function Turnstile({ onToken }: { onToken: (token: string) => void }) {
    const handleMessage = (event: any) => {
        //  Now we can add this token to any request header.
        //  Where backend will verify the token using Cloudflare API.
        const token = event.nativeEvent.data
        onToken(token)
    }

    return (
        <View style={{ width: 'auto', minHeight: 70, marginBottom: 60 }}>
            <WebView
                originWhitelist={['*']}
                onMessage={handleMessage}
                scalesPageToFit
                scrollEnabled={false}
                setDisplayZoomControls={false}
                setBuiltInZoomControls={false}
                source={{
                    baseUrl: 'http://vacario.nl',
                    html: `
                  <!DOCTYPE html>
                  <html>
                    <head>
                     <style>
                        html {
                            background: #19181c;
                            width: auto;
                            height: auto;
                            overflow: hidden;
                        }
                        
                        body {
                            background: #19181c;
                            width: auto;
                            height: auto;
                            transform: scale(3.8) translateX(36.7%);
                        }

                        iframe {
                            flex: 1;
                            height: 100%;
                            min-height: 100%;

                        }
                     </style>
                     <script src="https://challenges.cloudflare.com/turnstile/v0/api.js?onload=_turnstileCb" defer async></script>
                    </head>
                    <body>
                       <div id="turnstile_div" style="width: auto; height: auto; position: absolute; top: 0px; left: 0px; background: #19181c; display: flex; justify-content: space-evenly;"></div>
                       <script>
                          // This function is called when the Turnstile script is loaded and ready to be used.
                          function _turnstileCb() {
                              turnstile.render('#turnstile_div', {
                                sitekey: '0x4AAAAAAAMpF4whHF6dZwj5',
                                callback: (token) => {
                                  // Success callback, which sets the token into a separate store slice.
                                  window.ReactNativeWebView.postMessage(token);
                                },
                            });
                        }
                        window._turnstileCb = _turnstileCb
                       </script>
                    </body>
                  </html>
              `,
                }}
            />
        </View>
    )
}

export default Turnstile
