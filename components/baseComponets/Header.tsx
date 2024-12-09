import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from "@/constants/Colors";
import { getVolunteer } from '@/services/volunteer.service';
import { Volunteer } from '@/models/Volunteer';
import { getOrganization } from '@/services/organization.service';
import { Organization } from '@/models/Organization';
import { getValidDecodedToken } from '@/services/managers/TokenManager';
import { router } from 'expo-router';
import { UserType } from '@/enums/UserType';
import { MinPointsShieldLevels } from '@/enums/MinPointsShieldLevels';

type HeaderData = {
    userFirstName: string,
    userSurename: string,
    userProfileImageUrl: string,
    userProfileImageExtension: string,
    userAllPoints?: number,
}

type Props = {
    pageFrom: 'feed' | 'store' | 'events';
}

export default function Header(props: Props) {

    const [headerData, setHeaderData] = useState<HeaderData | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(true);
    const [userType, setUserType] = useState<UserType>(UserType.VOLUNTEER);

    useEffect(() => {
        const fetchData = async () => {
            try {
                await fetchUserData();
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);


    const fetchUserData = async () => {
        const tokenDecoded = await getValidDecodedToken();

        if (tokenDecoded) {
            try {
                if (tokenDecoded.type == "volunteer") {
                    setUserType(UserType.VOLUNTEER);
                    const volunteerData = await fetchVolunteerData(tokenDecoded.id);
                    if (volunteerData) {
                        setHeaderData({
                            userFirstName: volunteerData.name || 'Nome',
                            userSurename: volunteerData.surname || 'Sobrenome',
                            userProfileImageUrl: volunteerData.profilePictureBase64 || '',
                            userProfileImageExtension: volunteerData.profilePictureExtension || '.jpg',
                            userAllPoints: volunteerData.allTimePoints || 0,
                        });
                    }
                } else if (tokenDecoded.type == "organization") {
                    setUserType(UserType.ORGANIZATION);
                    const organizationData = await fetchOrganizationData(tokenDecoded.id);
                    if (organizationData) {
                        setHeaderData({
                            userFirstName: organizationData.tradingName || 'Nome Fantasia',
                            userSurename: '',
                            userProfileImageUrl: organizationData.profilePictureBase64 || '',
                            userProfileImageExtension: organizationData.profilePictureExtension || '.jpg',
                        });
                    }
                } else {
                    console.log('LINKA-LOG: User type incorrect');
                }
            } catch (error) {
                console.error('LINKA-LOG: Error fetching user data:', error);
            }
        } else {
            console.error('LINKA-LOG: Invalid token. Could not fetch user data.');
        }
    };

    const fetchVolunteerData = async (volunteerId: string): Promise<Volunteer | undefined> => {
        try {
            const response = await getVolunteer(volunteerId);
            return response as Volunteer;
        } catch (error) {
            console.error('LINKA-LOG: Error fetching volunteer data:', error);
            throw error;
        }
    };

    const fetchOrganizationData = async (organizationId: string): Promise<Organization | undefined> => {
        try {
            const response = await getOrganization(organizationId);
            return response as Organization;
        } catch (error) {
            console.error('LINKA-LOG: Error fetching organization data:', error);
            throw error;
        }
    };

    const returnShieldColor = (points: number): string => {
        if (points >= MinPointsShieldLevels.DIAMOND) {
            return Colors.diamond;
        } else if (points >= MinPointsShieldLevels.GOLD) {
            return Colors.gold;
        } else if (points >= MinPointsShieldLevels.SILVER) {
            return Colors.silver;
        } else {
            return Colors.bronze;
        }
    };

    return (
        <View style={styles.header}>
            {isLoading ? (
                <Text>Carregando...</Text>
            ) : (
                <>
                    <View style={styles.leftContainer}>
                        {headerData?.userProfileImageUrl ? (
                            <>
                                <Image
                                    source={{
                                        uri: `data:image/${headerData?.userProfileImageExtension};base64,${headerData?.userProfileImageUrl}`,
                                    }}
                                    style={styles.profileImage}
                                />
                                {userType === UserType.VOLUNTEER && headerData.userAllPoints != undefined &&
                                    <View style={styles.volunteerShield}>
                                        <Ionicons name="shield" size={20} color={returnShieldColor(headerData.userAllPoints)} />
                                    </View>}
                            </>
                        ) : (
                            <>
                                <Image
                                    source={require('@/assets/images/genericalProfilePhoto.jpg')}
                                    style={styles.profileImage}
                                />
                                {userType === UserType.VOLUNTEER && headerData && headerData.userAllPoints != undefined &&
                                    <View style={styles.volunteerShield}>
                                        <Ionicons name="shield" size={20} color={returnShieldColor(headerData.userAllPoints)} />
                                    </View>}
                            </>
                        )}
                        <View style={styles.textContainer}>
                            <Text style={styles.userName}>{`${headerData?.userFirstName} ${headerData?.userSurename}`}</Text>
                            {userType === UserType.VOLUNTEER && <Text style={styles.pointsText}>{`${headerData?.userAllPoints} pontos`}</Text>}
                        </View>
                    </View>
                    <View style={styles.rightContainer}>
                        {userType == UserType.VOLUNTEER && <TouchableOpacity onPress={() => { router.push({ pathname: '/screens/(header)/(notification)/notification', params: { pageFrom: props.pageFrom } }) }}>
                            <Ionicons name="notifications-outline" size={28} color={Colors.orange} style={styles.icon} />
                        </TouchableOpacity>}
                        <TouchableOpacity onPress={() => { router.push({ pathname: '/screens/(header)/(search)/search', params: { pageFrom: props.pageFrom } }) }}>
                            <Ionicons name="search-outline" size={28} color={Colors.orange} style={styles.icon} />
                        </TouchableOpacity>
                    </View>
                </>
            )
            }
        </View >
    );

}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: Colors.white,
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: Colors.mediumGray,
    },
    leftContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profileImage: {
        width: 50,
        height: 50,
        borderRadius: 100,
        marginRight: 10,
        borderWidth: 1,
        borderColor: Colors.mediumGray
    },
    userName: {
        fontSize: 16,
        color: Colors.black,
    },
    rightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        marginLeft: 15,
    },
    volunteerShield: {
        marginLeft: -23,
        marginRight: 5,
        marginTop: 30,
    },
    textContainer: {
    },
    pointsText: {
        color: Colors.gray,
        fontSize: 12,
        marginTop: 3,
    }
});
