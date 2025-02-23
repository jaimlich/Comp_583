
import SwiftUI
import MapKit
import CoreLocation

struct SnowMountainTrackerView: View {
    @StateObject private var locationManager = LocationManager()
    @State private var region = MKCoordinateRegion(
        center: CLLocationCoordinate2D(latitude: 37.7749, longitude: -122.4194),
        span: MKCoordinateSpan(latitudeDelta: 0.1, longitudeDelta: 0.1)
    )
    
    var body: some View {
        VStack {
            // Map View
            Map(coordinateRegion: $region, showsUserLocation: true)
                .frame(height: 300)
                .onAppear {
                    if let coordinate = locationManager.lastKnownLocation {
                        region.center = coordinate
                    }
                }
            
            // Weather Panel
            WeatherPanel()
                .padding()
            
            // Nearby Ski Resorts Panel
            NearbyResortsPanel()
                .padding()
            
            // Buy Ski Lift Pass Button
            Button("Buy Ski Lift Pass") {
                // Implement purchase functionality
            }
            .buttonStyle(.borderedProminent)
            .padding()
            
            // Profile Section
            ProfileView()
                .padding()
        }
        .padding()
    }
}

// Sample Weather Panel
struct WeatherPanel: View {
    var body: some View {
        VStack {
            Text("Current Weather: ❄️ -5°C")
                .font(.headline)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color.blue.opacity(0.2))
        .cornerRadius(10)
    }
}

// Sample Nearby Ski Resorts Panel
struct NearbyResortsPanel: View {
    var body: some View {
        VStack {
            Text("Nearby Ski Resorts")
                .font(.headline)
            Text("1. Snowy Peaks Resort - 5km")
            Text("2. Alpine Slopes - 10km")
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color.gray.opacity(0.2))
        .cornerRadius(10)
    }
}

// Sample Profile Section
struct ProfileView: View {
    var body: some View {
        VStack {
            Text("User Profile")
                .font(.headline)
            Text("Name: John Doe")
            Text("Membership: Gold")
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color.green.opacity(0.2))
        .cornerRadius(10)
    }
}

// Preview
struct SnowMountainTrackerView_Previews: PreviewProvider {
    static var previews: some View {
        SnowMountainTrackerView()
    }
}

import Foundation
import CoreLocation

final class LocationManager: NSObject, CLLocationManagerDelegate, ObservableObject {
    
    @Published var lastKnownLocation: CLLocationCoordinate2D?
    var manager = CLLocationManager()
    
    
    func checkLocationAuthorization() {
        
        manager.delegate = self
        manager.startUpdatingLocation()
        print("here")
        switch manager.authorizationStatus {
        case .notDetermined://The user choose allow or denny your app to get the location yet
            print("it should be requesting")
            manager.requestWhenInUseAuthorization()
            
        case .restricted://The user cannot change this app’s status, possibly due to active restrictions such as parental controls being in place.
            print("Location restricted")
            
        case .denied://The user dennied your app to get location or disabled the services location or the phone is in airplane mode
            print("Location denied")
            
        case .authorizedAlways://This authorization allows you to use all location services and receive location events whether or not your app is in use.
            print("Location authorizedAlways")
            
        case .authorizedWhenInUse://This authorization allows you to use all location services and receive location events only when your app is in use
            print("Location authorized when in use")
            lastKnownLocation = manager.location?.coordinate
            
        @unknown default:
            print("Location service disabled")
        
        }
    }
    
    func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {//Trigged every time authorization status changes
        checkLocationAuthorization()
    }
    
    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        lastKnownLocation = locations.first?.coordinate
    }
}

import SwiftUI

struct ContentView: View {
    @StateObject private var locationManager = LocationManager()
    
    var body: some View {
        SnowMountainTrackerView()
        VStack {
            if let coordinate = locationManager.lastKnownLocation {
                Text("Latitude: \(coordinate.latitude)")
                
                Text("Longitude: \(coordinate.longitude)")
            } else {
                Text("Unknown Location")
            }
            
            
            Button("Get location") {
                locationManager.checkLocationAuthorization()
            }
            .buttonStyle(.borderedProminent)
        }
        .padding()
    }
}



//import SwiftUI
//import CoreLocation
//
//struct ContentView: View {
//    @State private var zipCode: String = ""
//    @State private var displayedZipCode: String = ""
//    @StateObject private var locationManager = LocationManager()
//    @State private var isLoggedIn = false
//    
//    var body: some View {
//        if isLoggedIn {
//            MainView(zipCode: $zipCode, displayedZipCode: $displayedZipCode, locationManager: locationManager)
//        } else {
//            LoginView(isLoggedIn: $isLoggedIn)
//        }
//    }
//}
//
//struct LoginView: View {
//    @Binding var isLoggedIn: Bool
//    @State private var username: String = ""
//    @State private var password: String = ""
//    
//    var body: some View {
//        VStack {
//            Text("Login")
//                .font(.largeTitle)
//                .padding()
//            
//            TextField("Username", text: $username)
//                .padding()
//                .textFieldStyle(RoundedBorderTextFieldStyle())
//                .autocapitalization(.none)
//                .disableAutocorrection(true)
//            
//            SecureField("Password", text: $password)
//                .padding()
//                .textFieldStyle(RoundedBorderTextFieldStyle())
//            
//            Button(action: {
//                isLoggedIn = true
//            }) {
//                Text("Login")
//                    .padding()
//                    .frame(maxWidth: .infinity)
//                    .background(Color.blue)
//                    .foregroundColor(.white)
//                    .cornerRadius(8)
//            }
//            .padding(.horizontal)
//        }
//        .padding()
//    }
//}
//
//struct MainView: View {
//    @Binding var zipCode: String
//    @Binding var displayedZipCode: String
//    @ObservedObject var locationManager: LocationManager
//    
//    var body: some View {
//        ScrollView {
//            VStack {
//                Image(systemName: "mappin.and.ellipse")
//                    .imageScale(.large)
//                    .foregroundColor(.blue)
//                    .padding()
//                
//                Text("Enter Zip Code or Use Current Location")
//                    .font(.headline)
//                    .multilineTextAlignment(.center)
//                    .padding()
//                
//                TextField("Zip Code", text: $zipCode)
//                    .padding()
//                    .textFieldStyle(RoundedBorderTextFieldStyle())
//                    .keyboardType(.numberPad)
//                    .onSubmit {
//                        hideKeyboard()
//                    }
//                
//                Button(action: {
//                    displayedZipCode = zipCode
//                    hideKeyboard()
//                }) {
//                    Text("Submit")
//                        .padding()
//                        .frame(maxWidth: .infinity)
//                        .background(Color.blue)
//                        .foregroundColor(.white)
//                        .cornerRadius(8)
//                }
//                .padding(.horizontal)
//                
//                Button(action: {
//                    locationManager.requestLocation()
//                }) {
//                    Text("Use Current Location")
//                        .padding()
//                        .frame(maxWidth: .infinity)
//                        .background(Color.green)
//                        .foregroundColor(.white)
//                        .cornerRadius(8)
//                }
//                .padding(.horizontal)
//                .padding(.top, 5)
//                
//                if locationManager.authorizationStatus == .denied {
//                    Text("Location services are disabled. Please enable them in settings.")
//                        .foregroundColor(.red)
//                        .padding()
//                }
//                
//                if !displayedZipCode.isEmpty {
//                    Text("You entered: \(displayedZipCode)")
//                        .padding(.top)
//                }
//                
//                if let currentZip = locationManager.currentZipCode {
//                    Text("Current Location Zip Code: \(currentZip)")
//                        .padding(.top)
//                } else if locationManager.isRequestingLocation {
//                    ProgressView("Fetching location...")
//                        .padding()
//                }
//            }
//            .padding()
//        }
//    }
//    
//    private func hideKeyboard() {
//        UIApplication.shared.sendAction(#selector(UIResponder.resignFirstResponder), to: nil, from: nil, for: nil)
//    }
//}
//
//class LocationManager: NSObject, ObservableObject, CLLocationManagerDelegate {
//    private let locationManager = CLLocationManager()
//    @Published var currentZipCode: String?
//    @Published var authorizationStatus: CLAuthorizationStatus = .notDetermined
//    @Published var isRequestingLocation = false
//    
//    override init() {
//        super.init()
//        locationManager.delegate = self
//        DispatchQueue.main.async {
//            self.locationManager.requestAlwaysAuthorization()
//        }
//    }
//    
//    func requestLocation() {
//        authorizationStatus = locationManager.authorizationStatus
//        if authorizationStatus == .notDetermined {
//            locationManager.requestAlwaysAuthorization()
//        } else if authorizationStatus == .authorizedAlways {
//            isRequestingLocation = true
//            locationManager.requestLocation()
//        }
//    }
//    
//    func locationManager(_ manager: CLLocationManager, didChangeAuthorization status: CLAuthorizationStatus) {
//        DispatchQueue.main.async {
//            self.authorizationStatus = status
//            if status == .authorizedAlways {
//                self.requestLocation()
//            }
//        }
//    }
//    
//    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
//        guard let location = locations.first else { return }
//        fetchZipCode(from: location)
//    }
//    
//    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
//        print("Failed to find user’s location: \(error.localizedDescription)")
//        DispatchQueue.main.async {
//            self.isRequestingLocation = false
//        }
//    }
//    
//    private func fetchZipCode(from location: CLLocation) {
//        let geocoder = CLGeocoder()
//        geocoder.reverseGeocodeLocation(location) { (placemarks, error) in
//            DispatchQueue.main.async {
//                self.isRequestingLocation = false
//                if let error = error {
//                    print("Reverse geocoding failed: \(error.localizedDescription)")
//                    return
//                }
//                if let postalCode = placemarks?.first?.postalCode {
//                    self.currentZipCode = postalCode
//                }
//            }
//        }
//    }
//}
//
//struct ContentView_Previews: PreviewProvider {
//    static var previews: some View {
//        ContentView()
//    }
//}
