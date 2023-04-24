import { useTheme, Box } from 'native-base'
import { NavigationContainer, DefaultTheme } from '@react-navigation/native'

import { AuthRoutes } from './auth.routes'
import { AppRoutes } from './app.routes'

import { useAuth } from '@hooks/useAuth'
import { Loading } from '@components/Loading'

import * as Linking from 'expo-linking'

const linking = {
    prefixes: ['ignitegym://','exp+ignitegym://','com.cristianosilvadev.ignitegym://'],
    config: {
        screens: {
            exercise: {
                path: 'exercise/:exerciseId',
                parse: {
                    exerciseId: (exerciseId: string) => exerciseId
                }
            }
        }
    }
}

export function Routes() {
    const { colors } = useTheme()
    const { user, isLoadingUserStorageData } = useAuth()

    const theme = DefaultTheme
    theme.colors.background = colors.gray[700]

    const deepLinking = Linking.createURL('exercise', {
        queryParams: {
            exerciseId: '7'
        }
    })

    console.log(deepLinking)

    if(isLoadingUserStorageData){
        return <Loading />
    }

    return(
        <Box flex={1} bg={"gray.700"}>
            <NavigationContainer theme={theme} linking={linking}>
                {user.id ? <AppRoutes /> : <AuthRoutes/>}
            </NavigationContainer>
        </Box>
    )
}