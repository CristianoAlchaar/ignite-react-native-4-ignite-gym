import OneSignal from "react-native-onesignal";

export function tagUserInfoCreate(email : string, name: string) {
    OneSignal.sendTags({
        'user_name': name,
        'user_email': email
    });
}
