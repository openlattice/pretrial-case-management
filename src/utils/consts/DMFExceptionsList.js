import { CHARGE } from './Consts';

const {
  STATUTE,
  DESCRIPTION
} = CHARGE;

export const PENN_BOOKING_HOLD_EXCEPTIONS = [
  {
    [STATUTE]: '4.1',
    [DESCRIPTION]: 'County - Keeping of a Dangerous Animal (M2)'
  },
  {
    [STATUTE]: '4.12',
    [DESCRIPTION]: 'County - Animal Care and Treatment (M2)'
  },
  {
    [STATUTE]: '4.13',
    [DESCRIPTION]: 'County - Animal Maintenance of Places Where Kept (M2)'
  },
  {
    [STATUTE]: '4.17',
    [DESCRIPTION]: 'County - Animals Having Bitten or Attacked a Person (M2)'
  },
  {
    [STATUTE]: '4.22',
    [DESCRIPTION]: 'County - Animals Running at Large - Impoundment-Notice(M2)'
  },
  {
    [STATUTE]: '4.24',
    [DESCRIPTION]: 'County - Licensing Animal (M2)'
  },
  {
    [STATUTE]: '4.25',
    [DESCRIPTION]: 'County - Rabies Vaccination (M2)'
  },
  {
    [STATUTE]: '4.26',
    [DESCRIPTION]: 'County - Animal at Large (M2)'
  },
  {
    [STATUTE]: '4.9',
    [DESCRIPTION]: 'County - Noisy Animal (M2)'
  },
  {
    [STATUTE]: '7.03',
    [DESCRIPTION]: 'County - Speeding (Hill City) (M2)'
  },
  {
    [STATUTE]: '7.09',
    [DESCRIPTION]: 'County - Exhibition Driving (Hill City) (M2)'
  },
  {
    [STATUTE]: '7.11',
    [DESCRIPTION]: 'County - Stop Sign (Hill City) (M2)'
  },
  {
    [STATUTE]: '10.4',
    [DESCRIPTION]: 'County - Open Container (Hill City) (M)'
  },
  {
    [STATUTE]: '13.1',
    [DESCRIPTION]: 'County - Disorderly Conduct Nuisance (Keystone) (M2)'
  },
  {
    [STATUTE]: '13.5',
    [DESCRIPTION]: 'County - Abandoned Property (Keystone) (M2)'
  },
  {
    [STATUTE]: '14.1',
    [DESCRIPTION]: 'County - Disturbing the Peace (Keystone) (M2)'
  },
  {
    [STATUTE]: '14.2',
    [DESCRIPTION]: 'County - Disorderly Conduct (Keystone) (M2)'
  },
  {
    [STATUTE]: '14.8',
    [DESCRIPTION]: 'County - Carrying Weapons (Keystone) (M2)'
  },
  {
    [STATUTE]: '14.9',
    [DESCRIPTION]: 'County - Policing Interfere wi/Police Officer (Keystone) (M2)'
  },
  {
    [STATUTE]: '15.43',
    [DESCRIPTION]: 'County - Maximum Speed (Keystone) (M2)'
  },
  {
    [STATUTE]: '23',
    [DESCRIPTION]: 'County - Trespass Flood Ditch (New Underwood) (M2)'
  },
  {
    [STATUTE]: '44',
    [DESCRIPTION]: 'County - Dog Kept Under Restraint (Keystone) (M2)'
  },
  {
    [STATUTE]: '47',
    [DESCRIPTION]: 'County - Drug/Alcohol in Public Place (Keystone) (M2)'
  },
  {
    [STATUTE]: '48',
    [DESCRIPTION]: 'County - Explosives-Fireworks (Keystone) (M2)'
  },
  {
    [STATUTE]: '59',
    [DESCRIPTION]: 'County - Disorderly Conduct Public Nuisance (Box Elder) (M2)'
  },
  {
    [STATUTE]: '76',
    [DESCRIPTION]: 'County - Hour Parking (Keystone) (M2)'
  },
  {
    [STATUTE]: '81',
    [DESCRIPTION]: 'County - Abandoned/Junk Vehicle (Keystone) (M2)'
  },
  {
    [STATUTE]: '82.199',
    [DESCRIPTION]: 'County - Weapon in Alcohol Establishment (Keystone) (M2)'
  },
  {
    [STATUTE]: '84.92',
    [DESCRIPTION]: 'County - Mobile Home Skirting (Keystone) (M2)'
  },
  {
    [STATUTE]: '90.02',
    [DESCRIPTION]: 'Cruelty to Animals - General - Box Elder Ordinance'
  },
  {
    [STATUTE]: '90.02',
    [DESCRIPTION]: 'BEO Cruelty to Animals - General'
  },
  {
    [STATUTE]: '90.054',
    [DESCRIPTION]: 'BEO Bite - Quartine for Observation'
  },
  {
    [STATUTE]: '106.4',
    [DESCRIPTION]: 'County - Tattoos and Body Piercing at Establishment Only (M2)'
  },
  {
    [STATUTE]: '144',
    [DESCRIPTION]: 'County - Animals at Large (Box Elder) (M2)'
  },
  {
    [STATUTE]: '165',
    [DESCRIPTION]: 'County - Licenses-Business Violation (Box Elder) (M2)'
  },
  {
    [STATUTE]: '168',
    [DESCRIPTION]: 'County - Licenses - Moving Permit (Box Elder) (M2)'
  },
  {
    [STATUTE]: '184',
    [DESCRIPTION]: 'County - Parking Ordinance (Box Elder) (M2)'
  },
  {
    [STATUTE]: '195',
    [DESCRIPTION]: 'County - Littering-Trash (Box Elder) (M2)'
  },
  {
    [STATUTE]: '251',
    [DESCRIPTION]: 'County - Water Restriction (Box Elder) (M2)'
  },
  {
    [STATUTE]: '497.1',
    [DESCRIPTION]: 'County - Animal at Large (Box Elder) (M2)'
  },
  {
    [STATUTE]: '632',
    [DESCRIPTION]: 'County - Regulating Open Burning in Pennington County(M2)'
  },
  {
    [STATUTE]: '636',
    [DESCRIPTION]: 'County - Disorderly Conduct on County Premises (M2)'
  },
  {
    [STATUTE]: '636',
    [DESCRIPTION]: 'County - Disorderly Conduct on County Premises (M2)'
  },
  {
    [STATUTE]: '1163.06',
    [DESCRIPTION]: 'County - Stop Sign (Box Elder) (M2)'
  },
  {
    [STATUTE]: '1163.07',
    [DESCRIPTION]: 'County - Pedestrian Right of Way (Box Elder) (M2)'
  },
  {
    [STATUTE]: '1163.09',
    [DESCRIPTION]: 'County - Policing - Obedience to (Box Elder) (M2)'
  },
  {
    [STATUTE]: '1163.12',
    [DESCRIPTION]: 'County - Passing School Bus (Box Elder) (M2)'
  },
  {
    [STATUTE]: '1163.19',
    [DESCRIPTION]: 'County - Clinging to Motor Venicle (Box Elder) (M2)'
  },
  {
    [STATUTE]: '1163.2',
    [DESCRIPTION]: 'County - Riding on Outside of Vehicle (Box Elder) (M2)'
  },
  {
    [STATUTE]: '1163.21',
    [DESCRIPTION]: 'County - Following Fire Apparatus Prohibited (Box Elder) (M2)'
  },
  {
    [STATUTE]: '1163.22',
    [DESCRIPTION]: 'Crossing Fire Hose (Box Elder) (M2)'
  },
  {
    [STATUTE]: '1163.24',
    [DESCRIPTION]: 'County - Speeding (Box Elder) (M2)'
  },
  {
    [STATUTE]: '1163.25',
    [DESCRIPTION]: 'County - Reckless Careless and Exhibition Driving (Box Elder) (M2)'
  },
  {
    [STATUTE]: '1163.26',
    [DESCRIPTION]: 'County - Passing in a No Passing Zone (Box Elder) (M2)'
  },
  {
    [STATUTE]: '1163.29',
    [DESCRIPTION]: 'County - Tampering w/MV (Box Elder) (M2)'
  },
  {
    [STATUTE]: '1163.3',
    [DESCRIPTION]: 'County - Right-of-Way (Box Elder) (M2)'
  },
  {
    [STATUTE]: '1169.01',
    [DESCRIPTION]: 'County - Assault-Battery (Box Elder) (M2)'
  },
  {
    [STATUTE]: '1169.02',
    [DESCRIPTION]: 'County - Disorderly Conduct (Box Elder) (M2)'
  },
  {
    [STATUTE]: '1169.03',
    [DESCRIPTION]: 'County - Disturbing the Peace (Box Elder) (M2)'
  },
  {
    [STATUTE]: '5912',
    [DESCRIPTION]: 'County - Dog at Large (Box Elder) (M2)'
  },
  {
    [STATUTE]: '11611.01',
    [DESCRIPTION]: 'County - Discharging Firearm  Prohibited (Boxl Edler) (M2)'
  },
  {
    [STATUTE]: '1-20-36',
    [DESCRIPTION]: 'Trepass on Private Land(M2)'
  },
  {
    [STATUTE]: '9-14-37',
    [DESCRIPTION]: 'Neglect of Duty or Misconduct by Municipal Officer(M2)'
  },
  {
    [STATUTE]: '3-16-7',
    [DESCRIPTION]: 'MISCONDUCT IN OFFICE - OFFICER\'S INTEREST IN PUBLIC CONTRACT(M2)'
  },
  {
    [STATUTE]: '5-4-15',
    [DESCRIPTION]: 'Open Fire on Public Lands(M2)'
  },
  {
    [STATUTE]: '12-26-22',
    [DESCRIPTION]: 'Disturbance of Election Proceedings(M2)'
  },
  {
    [STATUTE]: '49511',
    [DESCRIPTION]: 'County - Flood Hazardous Reduction Anchoring (Keystone) (M2)'
  },
  {
    [STATUTE]: '1.12.010',
    [DESCRIPTION]: 'City - Designated-Continuing Violation(M2)'
  },
  {
    [STATUTE]: '10.08.030',
    [DESCRIPTION]: 'City - Traffic Direction Compliance Required (LE, Fire or Crossing Guard)'
  },
  {
    [STATUTE]: '10.12.010',
    [DESCRIPTION]: 'City - Driving on Wrong Side of Road(M2)'
  },
  {
    [STATUTE]: '10.12.040',
    [DESCRIPTION]: 'City - Passing on Right(M2)'
  },
  {
    [STATUTE]: '10.12.060',
    [DESCRIPTION]: 'City - Signals Required when Starting, Stopping or Turning(M2)'
  },
  {
    [STATUTE]: '10.12.070',
    [DESCRIPTION]: 'City - Improper Turn(M2)'
  },
  {
    [STATUTE]: '10.12.070 (1)',
    [DESCRIPTION]: 'City - Right Turn - Lane Position(M2)'
  },
  {
    [STATUTE]: '10.12.070 (2)',
    [DESCRIPTION]: 'City - Left Turn - Lane Position(M2)'
  },
  {
    [STATUTE]: '10.12.080',
    [DESCRIPTION]: 'City - Turning Restrictions(M2)'
  },
  {
    [STATUTE]: '10.12.090',
    [DESCRIPTION]: 'City - Illegal U-Turn(M2)'
  },
  {
    [STATUTE]: '10.12.100',
    [DESCRIPTION]: 'City - Fail to Yield Right-of-Way(M2)'
  },
  {
    [STATUTE]: '10.12.110',
    [DESCRIPTION]: 'City - Left Turn/Oncoming Traffic(M1)'
  },
  {
    [STATUTE]: '10.12.120 (B)',
    [DESCRIPTION]: 'City - Stop Sign Violation(M2)'
  },
  {
    [STATUTE]: '10.12.130',
    [DESCRIPTION]: 'City - Failure to Yield at Yield Sign/Yield Intersections(M2)'
  },
  {
    [STATUTE]: '10.12.140',
    [DESCRIPTION]: 'City - Failure to Yield from Private Property(M2)'
  },
  {
    [STATUTE]: '10.12.150',
    [DESCRIPTION]: 'City - Failure to Stop from Alley, Driveway or Building(M2)'
  },
  {
    [STATUTE]: '10.12.160',
    [DESCRIPTION]: 'City - Failure to Yield to Emergency Vehicles(M2)'
  },
  {
    [STATUTE]: '10.12.170',
    [DESCRIPTION]: 'City - Failure to Stop For Emergency Vehicle(M2)'
  },
  {
    [STATUTE]: '10.12.180',
    [DESCRIPTION]: 'City - Duty to Obey Red/Amber or Stop for a School Bus(M2)'
  },
  {
    [STATUTE]: '10.12.190',
    [DESCRIPTION]: 'City - Failure to Stop at RR Crossing(M2)'
  },
  {
    [STATUTE]: '10.12.190 (B)',
    [DESCRIPTION]: 'City - Special Vehicles Fail to Stop at RR Crossing(M2)'
  },
  {
    [STATUTE]: '10.12.200',
    [DESCRIPTION]: 'City - Wrong Way on One-Way Streets and Alleys(M2)'
  },
  {
    [STATUTE]: '10.12.210',
    [DESCRIPTION]: 'City - Illegal Entry or Exit of Highway(M2)'
  },
  {
    [STATUTE]: '10.12.230',
    [DESCRIPTION]: 'City -- Obstructing Intersections or Crosswalks(M2)'
  },
  {
    [STATUTE]: '10.12.240',
    [DESCRIPTION]: 'City - Unsafe Backing(M2)'
  },
  {
    [STATUTE]: '10.12.250',
    [DESCRIPTION]: 'City - Following too Closely(M2)'
  },
  {
    [STATUTE]: '10.12.260',
    [DESCRIPTION]: 'City - Following Fire Apparatus or Driving or Stopping Near Scene of Fire(M2)'
  },
  {
    [STATUTE]: '10.12.270',
    [DESCRIPTION]: 'City - Driving Over Fire Hose(M2)'
  },
  {
    [STATUTE]: '10.12.290',
    [DESCRIPTION]: 'City - Breaking into a Funeral Procession(M2)'
  },
  {
    [STATUTE]: '10.12.300',
    [DESCRIPTION]: 'City - Crossing Sidewalks'
  },
  {
    [STATUTE]: '10.12.310',
    [DESCRIPTION]: 'City - Speeding (M2)'
  },
  {
    [STATUTE]: '10.12.310',
    [DESCRIPTION]: 'City - Speeding Beyond Reason - Overdriving Road Conditions (M2)'
  },
  {
    [STATUTE]: '10.12.310',
    [DESCRIPTION]: 'Speeding (11-15 MPH Over Limit) (M2)'
  },
  {
    [STATUTE]: '10.12.310',
    [DESCRIPTION]: 'Speeding (1-5 MPH Over Limit)(M2)'
  },
  {
    [STATUTE]: '10.12.310',
    [DESCRIPTION]: 'Speeding (16-20 MPH Over Limit)(M2)'
  },
  {
    [STATUTE]: '10.12.310',
    [DESCRIPTION]: 'Speeding (21-25 MPH Over Limit)(M2)'
  },
  {
    [STATUTE]: '10.12.310',
    [DESCRIPTION]: 'Speeding (26 + MPH Over Limit)(M2)'
  },
  {
    [STATUTE]: '10.12.310',
    [DESCRIPTION]: 'Speeding (6-10 MPH Over Limit)(M2)'
  },
  {
    [STATUTE]: '10.12.310 (A2)',
    [DESCRIPTION]: 'City - Speeding in a Construciton Zone (6-10 MPH Over Limit)(M2)'
  },
  {
    [STATUTE]: '10.12.310 (A2)',
    [DESCRIPTION]: 'City - Speeding in a Construction Zone (11-15 MPH Over Limit)(M2)'
  },
  {
    [STATUTE]: '10.12.310 (A2)',
    [DESCRIPTION]: 'City - Speeding in a Contruction Zone (16-20 MPH Over Limit)(M2)'
  },
  {
    [STATUTE]: '10.12.310 (A2)',
    [DESCRIPTION]: 'City - Speeding in a Contruction Zone (21-25 MPH Over Limit)(M2)'
  },
  {
    [STATUTE]: '10.12.310 (A2)',
    [DESCRIPTION]: 'City - Speeding in a Contruction Zone (26+ MPH Over Limit)(M2)'
  },
  {
    [STATUTE]: '10.12.310 (A2)',
    [DESCRIPTION]: 'City- Speeding in a Construction Zone (1-5 MPH Over Limit)(M2)'
  },
  {
    [STATUTE]: '10.12.310 (B2)',
    [DESCRIPTION]: 'City - Speeding in a School Zone (1-5 MPH Over Limit)(M2)'
  },
  {
    [STATUTE]: '10.12.310 (B2)',
    [DESCRIPTION]: 'City - Speeding in a School Zone (16-20 MPH Over Limit)(M2)'
  },
  {
    [STATUTE]: '10.12.310 (B2)',
    [DESCRIPTION]: 'City - Speeding in a School Zone (21-25 MPH Over Limit)(M2)'
  },
  {
    [STATUTE]: '10.12.310 (B2)',
    [DESCRIPTION]: 'City - Speeding in a School Zone (26+ MPH Over Limit)(M2)'
  },
  {
    [STATUTE]: '10.12.310 (B2)',
    [DESCRIPTION]: 'City - Speeding in a School Zone (6-10 MPH Over Limit)(M2)'
  },
  {
    [STATUTE]: '10.12.310 (B2)',
    [DESCRIPTION]: 'City - Speeding in a School Zone(M2)'
  },
  {
    [STATUTE]: '10.12.310 (B2)',
    [DESCRIPTION]: 'City - Speeding in a School Zone (11-15 MPH Over Limit)(M2)'
  },
  {
    [STATUTE]: '10.12.320',
    [DESCRIPTION]: 'City - Impeding Traffic Flow (M2)'
  },
  {
    [STATUTE]: '10.12.330',
    [DESCRIPTION]: 'City - Drag Racing on Private Property (M2)'
  },
  {
    [STATUTE]: '10.12.340 (B)',
    [DESCRIPTION]: 'City - Careless Driving(M2)'
  },
  {
    [STATUTE]: '10.12.350',
    [DESCRIPTION]: 'City - Exhibition Driving(M2)'
  },
  {
    [STATUTE]: '10.12.360',
    [DESCRIPTION]: 'City - Unauthorized Operation of Vehicles on Private and Public Property Prohibited(M2)'
  },
  {
    [STATUTE]: '10.12.360 (A)',
    [DESCRIPTION]: 'City - Unauthorized Operatioin of Vehicle on Private Property(M2)'
  },
  {
    [STATUTE]: '10.12.380',
    [DESCRIPTION]: 'City - Fail to Stop on Signal or Eluding a Police Vehicle(M1)'
  },
  {
    [STATUTE]: '10.12.400',
    [DESCRIPTION]: 'City - Failure to Move Over/Vehicle Using Hazard Lights(M2)'
  },
  {
    [STATUTE]: '10.12.410',
    [DESCRIPTION]: 'Texting or Certain Uses of Handheld Devices Prohibited While Driving'
  },
  {
    [STATUTE]: '10.16.030',
    [DESCRIPTION]: 'City - Accident Hit and Run(M2)'
  },
  {
    [STATUTE]: '10.16.040',
    [DESCRIPTION]: 'City - Hit & Run-Duty Upon Striking Unattended Vehicle(M2)'
  },
  {
    [STATUTE]: '10.16.050',
    [DESCRIPTION]: 'City - Accident Hit & Run Duty Upon Striking Fixtures on Street(M2)'
  },
  {
    [STATUTE]: '10.16.060',
    [DESCRIPTION]: 'City - Failure to Report Accident(M2)'
  },
  {
    [STATUTE]: '10.20.020',
    [DESCRIPTION]: 'City - Illegal Muffler and Exhaust Systems(M2)'
  },
  {
    [STATUTE]: '10.20.030 (B)',
    [DESCRIPTION]: 'City - Illegal Horns and Other Warning Devices(M1)'
  },
  {
    [STATUTE]: '10.20.040',
    [DESCRIPTION]: 'City - Vehicle Unsafe/Brakes(M2)'
  },
  {
    [STATUTE]: '10.20.050 (A)',
    [DESCRIPTION]: 'City - Headlights/Taillights Required(M2)'
  },
  {
    [STATUTE]: '10.20.050 (A)',
    [DESCRIPTION]: 'City - Lights Time Usage(M2)'
  },
  {
    [STATUTE]: '10.20.050 (B)',
    [DESCRIPTION]: 'City - Fail to Dim Headlights(M2)'
  },
  {
    [STATUTE]: '10.20.060',
    [DESCRIPTION]: 'City - Obstructed View (M2)'
  },
  {
    [STATUTE]: '10.20.060 (A)',
    [DESCRIPTION]: 'City - Obstruction on Windshields and Side Windows(M2)'
  },
  {
    [STATUTE]: '10.20.060 (B)',
    [DESCRIPTION]: 'City - Dangling Objects from Mirror(M2)'
  },
  {
    [STATUTE]: '10.20.070',
    [DESCRIPTION]: 'City - Operating Tracked Vehicle on Road (Use of lugs, ice spurs or log chains on wheels)(M2)'
  },
  {
    [STATUTE]: '10.20.090',
    [DESCRIPTION]: 'City - Unsecured Load(M2)'
  },
  {
    [STATUTE]: '10.20.100',
    [DESCRIPTION]: 'City - Flag or Light for Projecting Loads(M2)'
  },
  {
    [STATUTE]: '10.20.110',
    [DESCRIPTION]: 'City - Attached Objects that Drag, Swing or Protrude from Vehicle(M2)'
  },
  {
    [STATUTE]: '10.20.120',
    [DESCRIPTION]: 'City - Use of Dynamic Brake Device Prohibited(M2)'
  },
  {
    [STATUTE]: '10.24.020',
    [DESCRIPTION]: 'City - Motor Vehicle Noise(M2)'
  },
  {
    [STATUTE]: '10.28.030',
    [DESCRIPTION]: 'City - Improper Lane Usage/Wrong Side Island (Do Not Use)'
  },
  {
    [STATUTE]: '10.28.050',
    [DESCRIPTION]: 'City - Failure to Stay in Marked Lanes(M2)'
  },
  {
    [STATUTE]: '10.28.070',
    [DESCRIPTION]: 'City - Disobey Flashing Signals(M2)'
  },
  {
    [STATUTE]: '10.28.090 (A)',
    [DESCRIPTION]: 'City - Fail to Obey Traffic Controll Device or Sign(M2)'
  },
  {
    [STATUTE]: '10.28.090 (B)',
    [DESCRIPTION]: 'City - Avoidance of Traffic Signal or Device(M2)'
  },
  {
    [STATUTE]: '10.32.040',
    [DESCRIPTION]: 'City - Driving Off Truck Route(M2)'
  },
  {
    [STATUTE]: '10.36.010',
    [DESCRIPTION]: 'City - Failure to Yield Right of Way/Crosswalk (DO NOT USE)'
  },
  {
    [STATUTE]: '10.36.030',
    [DESCRIPTION]: 'City - Failure to Yield to Person with Guide Dog or Cane(M2)'
  },
  {
    [STATUTE]: '10.40.020',
    [DESCRIPTION]: 'City - Stopping/Standing/Parking on or in Prohibited Area(M2)'
  },
  {
    [STATUTE]: '10.40.040',
    [DESCRIPTION]: 'City - Parking-Parallel and Angle Parking(M1)'
  },
  {
    [STATUTE]: '10.40.100',
    [DESCRIPTION]: 'City - Handicapped Parking Spaces-Unlawful Parking(M2)'
  },
  {
    [STATUTE]: '10.44.150 (G)',
    [DESCRIPTION]: 'City - Unlawful Tampering with Immobilization Device (Boot)(M2)'
  },
  {
    [STATUTE]: '10.50.270',
    [DESCRIPTION]: 'City - Minimum Off-Street Parking Requirements(M2)'
  },
  {
    [STATUTE]: '10.52.010',
    [DESCRIPTION]: 'City - Skateboarding - Prohibitions(M2)'
  },
  {
    [STATUTE]: '10.52.020',
    [DESCRIPTION]: 'City - Use of Skates or toy Vehicles on Roadways(M2)'
  },
  {
    [STATUTE]: '10.52.030',
    [DESCRIPTION]: 'City - Helmets Required When Riding Motorcycles - Under 18 Years of Age(M2)'
  },
  {
    [STATUTE]: '10.52.040',
    [DESCRIPTION]: 'City - Clinging to Motor Vehicle (Coaster, Sled, Skis, Roller Skates, any Toy) (M2)'
  },
  {
    [STATUTE]: '10.52.050',
    [DESCRIPTION]: 'City - Boarding or Alighting From Moving Vehicle(M2)'
  },
  {
    [STATUTE]: '10.52.060',
    [DESCRIPTION]: 'City - Riding on Portion of Vehicle Not For Passenger(M2)'
  },
  {
    [STATUTE]: '10.52.070',
    [DESCRIPTION]: 'City - Auto Related-Tampering with Motor Vehicle(M2)'
  },
  {
    [STATUTE]: '10.56.030',
    [DESCRIPTION]: 'City - No Storing, Parking or Leaving Abandoned or Junk Vehicle on Public Property(M2)'
  },
  {
    [STATUTE]: '10.64.150',
    [DESCRIPTION]: 'City - Auto Related-Clinging to Motor Vehicle on Bicycle(M2)'
  },
  {
    [STATUTE]: '10.64.170',
    [DESCRIPTION]: 'City - Bicycle -Lane Position(M2)'
  },
  {
    [STATUTE]: '10.64.210 (B)',
    [DESCRIPTION]: 'City - Bicycle -Yield to Pedestrians(M2)'
  },
  {
    [STATUTE]: '10.64.210 (C)',
    [DESCRIPTION]: 'City - Bicycle -Operating on Sidewalk Downtown Prohibited(M2)'
  },
  {
    [STATUTE]: '10.64.230',
    [DESCRIPTION]: 'City - Bicycle-Must Yield Before Emerging from Alley, Driveway or Building(M2)'
  },
  {
    [STATUTE]: '10.68.020 (A)',
    [DESCRIPTION]: 'City - No Snowmobile Registration(M2)'
  },
  {
    [STATUTE]: '10.68.030',
    [DESCRIPTION]: 'City - Equimpment Offense-Snowmobile(M2)'
  },
  {
    [STATUTE]: '10.68.030 (A)',
    [DESCRIPTION]: 'City - Equipment Offense - Snowmobile- No Muffler(M2)'
  },
  {
    [STATUTE]: '10.68.040',
    [DESCRIPTION]: 'City - Snowmobile-Violations(M2)'
  },
  {
    [STATUTE]: '10.68.040 (A)',
    [DESCRIPTION]: 'City - Snowmobile Violations - Operation on Street(M2)'
  },
  {
    [STATUTE]: '10.68.040 (E)',
    [DESCRIPTION]: 'City - Snowmobile Violations - Careless/Reckless Driving(M2)'
  },
  {
    [STATUTE]: '10-40-180',
    [DESCRIPTION]: 'Removal of vehicles parking in violation of title'
  },
  {
    [STATUTE]: '10-46A-13.1',
    [DESCRIPTION]: 'Tax-Contractors Excise/False/Fail(M2)'
  },
  {
    [STATUTE]: '10-46A-8',
    [DESCRIPTION]: 'Tax- Report and Payment(M2)'
  },
  {
    [STATUTE]: '10-47B-187',
    [DESCRIPTION]: 'Fuel Permit Violation(M2)'
  },
  {
    [STATUTE]: '10-59-13',
    [DESCRIPTION]: 'Distress Warrant(M2)'
  },
  {
    [STATUTE]: '106.4-1',
    [DESCRIPTION]: 'County - Public Nuisance(M2)'
  },
  {
    [STATUTE]: '12.1.57',
    [DESCRIPTION]: 'County - Speeding - (Keystone) (M2)'
  },
  {
    [STATUTE]: '12.12.070',
    [DESCRIPTION]: 'City - Public Right-of-Ways - Work Impeding Use(M2)'
  },
  {
    [STATUTE]: '12.12.090',
    [DESCRIPTION]: 'City - Sidewalks - Snow and Ice Removal(M2)'
  },
  {
    [STATUTE]: '12.12.100',
    [DESCRIPTION]: 'City - Snow - Placing on Public Property(M2)'
  },
  {
    [STATUTE]: '12.16.040',
    [DESCRIPTION]: 'County - No Parking-Snow Alert (Wall) (M2)'
  },
  {
    [STATUTE]: '12.2.2',
    [DESCRIPTION]: 'County - Parking on State Hwy - (Keystone) (M2)'
  },
  {
    [STATUTE]: '12.24.010',
    [DESCRIPTION]: 'City - Trespassing-Park Closed (M2)'
  },
  {
    [STATUTE]: '12.24.030',
    [DESCRIPTION]: 'City - Park Traffic Regulations(M2)'
  },
  {
    [STATUTE]: '12.24.040',
    [DESCRIPTION]: 'City - DC - Loafing in Parks(M2)'
  },
  {
    [STATUTE]: '12.24.050',
    [DESCRIPTION]: 'City - Driving on Bicycle and Pedestrial Trail System(M2)'
  },
  {
    [STATUTE]: '12.24.090',
    [DESCRIPTION]: 'City - Canyon Lake - Operation of Motorboats(M2)'
  },
  {
    [STATUTE]: '12.24.100',
    [DESCRIPTION]: 'City - Dinosaur Park Vandalizing Prohibited(M2)'
  },
  {
    [STATUTE]: '12.30.030',
    [DESCRIPTION]: 'City - Sign/Banner Code Vio-Structure in Right of Way (REPEALED - DO NOT USE)'
  },
  {
    [STATUTE]: '1-25-1.1',
    [DESCRIPTION]: 'Notice of meetings of public bodies (M2)'
  },
  {
    [STATUTE]: '13.04.240',
    [DESCRIPTION]: 'City - Fraudulent Connections(M2)'
  },
  {
    [STATUTE]: '13.04.250',
    [DESCRIPTION]: 'City - Unlawful Turning On/Off or Interference(M2)'
  },
  {
    [STATUTE]: '13.08.180',
    [DESCRIPTION]: 'City - Theft-Unlawaful Turning On/Off or Interference(M2)'
  },
  {
    [STATUTE]: '13.08.190',
    [DESCRIPTION]: 'City - Taking of Water from Fire Hydrants(M2)'
  },
  {
    [STATUTE]: '13.08.380',
    [DESCRIPTION]: 'City - Theft-Remote Reading Device(M2)'
  },
  {
    [STATUTE]: '13.08.440',
    [DESCRIPTION]: 'City - Water Conservation Measures - Watering Outside Restricted Times(M2)'
  },
  {
    [STATUTE]: '13-27-1',
    [DESCRIPTION]: 'Truancy (M2)'
  },
  {
    [STATUTE]: '13-27-11',
    [DESCRIPTION]: 'Failure to Send Child to School - First Offense (M2)'
  },
  {
    [STATUTE]: '13-32-6',
    [DESCRIPTION]: 'Disturbance of School (M2)'
  },
  {
    [STATUTE]: '13-32-6',
    [DESCRIPTION]: 'Disturbance of School - STAR Event (M2)'
  },
  {
    [STATUTE]: '15.04.050',
    [DESCRIPTION]: 'City - Violating Stop Work Order(M2)'
  },
  {
    [STATUTE]: '15.04.060',
    [DESCRIPTION]: 'City - Occupancy Violations(M2)'
  },
  {
    [STATUTE]: '15.04.070',
    [DESCRIPTION]: 'City - Certificate of Occupancy and Certificate of Completion(M2)'
  },
  {
    [STATUTE]: '15.04.140',
    [DESCRIPTION]: 'City - Contractors License Required(M2)'
  },
  {
    [STATUTE]: '15.04.150',
    [DESCRIPTION]: 'City - Building Permit Required(M2)'
  },
  {
    [STATUTE]: '15.08.030',
    [DESCRIPTION]: 'City - Standing Still in Public Street - Obstructing Railways(M2)'
  },
  {
    [STATUTE]: '15.08.040',
    [DESCRIPTION]: 'City - Cutting or Trimming Trees, Shrubbery, Flowers or Grass(M2)'
  },
  {
    [STATUTE]: '15.08.060',
    [DESCRIPTION]: 'City - Moving a Building Without Paying For a Permit(M2)'
  },
  {
    [STATUTE]: '15.12.910',
    [DESCRIPTION]: 'City - Maintaining A Structure with Hazards (Do Not Use)'
  },
  {
    [STATUTE]: '15.14.010',
    [DESCRIPTION]: 'City - Prohibited Occupancy (DO NOT USE)'
  },
  {
    [STATUTE]: '15-6-45(f)',
    [DESCRIPTION]: 'Failure to Obey Subpoena(M2)'
  },
  {
    [STATUTE]: '16-15-1',
    [DESCRIPTION]: 'Action or Arrest in Improper name (M2)'
  },
  {
    [STATUTE]: '16-15-2',
    [DESCRIPTION]: 'Disorderly behavior in court (M2)'
  },
  {
    [STATUTE]: '16-15-6',
    [DESCRIPTION]: 'Contempt - Disobedience of Judicial Process (M2)'
  },
  {
    [STATUTE]: '16-15-7',
    [DESCRIPTION]: 'Resistance to judicial process (M2)'
  },
  {
    [STATUTE]: '17.12.020',
    [DESCRIPTION]: 'Permitted Principal and accessory uses and structures'
  },
  {
    [STATUTE]: '17.22.020',
    [DESCRIPTION]: 'City - Violation of Zoning-Light Industrial(M2)'
  },
  {
    [STATUTE]: '17.50.080 (D)',
    [DESCRIPTION]: 'City - Signage - Prohibited Signs(M2)'
  },
  {
    [STATUTE]: '17.50.080 (D) (6)',
    [DESCRIPTION]: 'City - Signage - Advertising Trailer(M2)'
  },
  {
    [STATUTE]: '17.50.080 (D) (8)',
    [DESCRIPTION]: 'City - Signage - Unlawful Banners(M2)'
  },
  {
    [STATUTE]: '17.50.080 (G)',
    [DESCRIPTION]: 'City - Signage - No Sign Permit(M2)'
  },
  {
    [STATUTE]: '17.50.080 (K)',
    [DESCRIPTION]: 'City - Signage - Electrical Signs(M2)'
  },
  {
    [STATUTE]: '17.50.080 (Z)',
    [DESCRIPTION]: 'City - Singage Orindance Violation(M2)'
  },
  {
    [STATUTE]: '17.50.230',
    [DESCRIPTION]: 'City - Temporary Retail Business Structure(M2)'
  },
  {
    [STATUTE]: '17.50.250',
    [DESCRIPTION]: 'City - Yard, Building Setbak and Open Space Exceptions'
  },
  {
    [STATUTE]: '17.50.280',
    [DESCRIPTION]: 'City - Storage and Parking of Trailers and Commercial Vehicles(M2)'
  },
  {
    [STATUTE]: '18-1-11',
    [DESCRIPTION]: 'Notarizing Without Appearance by Parties (M2)'
  },
  {
    [STATUTE]: '19-7-14',
    [DESCRIPTION]: 'Suppression/Destruction/Tampering with Evidence (M2)'
  },
  {
    [STATUTE]: '22-11-1',
    [DESCRIPTION]: 'Resisting Execution or Service of Process (M2)'
  },
  {
    [STATUTE]: '22-11-23',
    [DESCRIPTION]: 'Forgery - Falsification of Public Records(M2)'
  },
  {
    [STATUTE]: '22-11-3',
    [DESCRIPTION]: 'Obstructing Certain Public Officers or employees (M2)'
  },
  {
    [STATUTE]: '22-11-3.1',
    [DESCRIPTION]: 'Refusing to Aid Law Enforcement Officer (REPEALED)'
  },
  {
    [STATUTE]: '22-13-17',
    [DESCRIPTION]: 'Picketing of Funeral Services Prohibited (M2)'
  },
  {
    [STATUTE]: '22-14-29',
    [DESCRIPTION]: 'Weapons-Butterfly/Balisong Knife by Minors Prohibited (DO NOT USE-REPEALED)'
  },
  {
    [STATUTE]: '22-18-35',
    [DESCRIPTION]: 'Disorderly Conduct (M2)'
  },
  {
    [STATUTE]: '22-18-35',
    [DESCRIPTION]: 'Disorderly Conduct with Physical Contact (M2)'
  },
  {
    [STATUTE]: '22-24-1.1',
    [DESCRIPTION]: 'Public Indecency (M2)'
  },
  {
    [STATUTE]: '22-24-33',
    [DESCRIPTION]: 'Misrepresentation of Age by a Minor(M2)'
  },
  {
    [STATUTE]: '22-25-1',
    [DESCRIPTION]: 'Engaging in Gambling or Keep Gambling Establishment(M2)'
  },
  {
    [STATUTE]: '22-25-1',
    [DESCRIPTION]: 'Gambling(M2)'
  },
  {
    [STATUTE]: '22-25-26',
    [DESCRIPTION]: 'Unauthorized Bingo or Lottery(M2)'
  },
  {
    [STATUTE]: '22-29-9.1',
    [DESCRIPTION]: 'Oath Required to Obtain State Benefits (M2)'
  },
  {
    [STATUTE]: '22-30A-13',
    [DESCRIPTION]: 'Theft of Rental Property by Conversion(M2)'
  },
  {
    [STATUTE]: '22-30A-17.3',
    [DESCRIPTION]: 'Theft - Petty Theft All Others Less Than $400(M2)'
  },
  {
    [STATUTE]: '22-30A-17.3',
    [DESCRIPTION]: 'Theft / OPWP $0 - $400 (M2)'
  },
  {
    [STATUTE]: '22-30A-17.3',
    [DESCRIPTION]: 'Purse Snatching Less than $400(M2)'
  },
  {
    [STATUTE]: '22-30A-17.3',
    [DESCRIPTION]: 'Theft By Deception $0 - $400(M2)'
  },
  {
    [STATUTE]: '22-30A-17.3',
    [DESCRIPTION]: 'Theft by False Credit Card(M2)'
  },
  {
    [STATUTE]: '22-30A-17.3',
    [DESCRIPTION]: 'Theft / Embezzlement $0 - $400(M2)'
  },
  {
    [STATUTE]: '22-30A-17.3',
    [DESCRIPTION]: 'Theft from Building $0 - $400(M2)'
  },
  {
    [STATUTE]: '22-30A-17.3',
    [DESCRIPTION]: 'Theft From Building (DO NOT USE)'
  },
  {
    [STATUTE]: '22-30A-17.3',
    [DESCRIPTION]: 'Theft from Coin Operated Machine $0 - $400(M2)'
  },
  {
    [STATUTE]: '22-30A-17.3',
    [DESCRIPTION]: 'Theft from Motor Vehicle $0 - $400(M2)'
  },
  {
    [STATUTE]: '22-30A-17.3',
    [DESCRIPTION]: 'Theft of a Motor Vehicle $0 - $400(M2)'
  },
  {
    [STATUTE]: '22-30A-17.3',
    [DESCRIPTION]: 'Theft of Motor Vehicle Parts and Accessories $0 - $400(M2)'
  },
  {
    [STATUTE]: '22-30A-17.3',
    [DESCRIPTION]: 'Theft - Pocket Picking $0 - $400(M2)'
  },
  {
    [STATUTE]: '22-30A-17.3',
    [DESCRIPTION]: 'Theft - Purse Snatching Less than $400(M2)'
  },
  {
    [STATUTE]: '22-30A-17.3',
    [DESCRIPTION]: 'Theft - Transfer of Another\'s Property (M2)'
  },
  {
    [STATUTE]: '22-30A-24',
    [DESCRIPTION]: 'Fraud-Theft by Insufficient Funds Check less than $1000 (DO NOT USE)'
  },
  {
    [STATUTE]: '22-30A-24',
    [DESCRIPTION]: 'Passing NSF Checks $400 or less (M2)'
  },
  {
    [STATUTE]: '22-30A-24',
    [DESCRIPTION]: 'Passing NSF Checks less than $400 (M2)'
  },
  {
    [STATUTE]: '22-30A-25',
    [DESCRIPTION]: 'Passing No Account Check - $400 or less(M2)'
  },
  {
    [STATUTE]: '22-30A-25',
    [DESCRIPTION]: 'Passing No Account Check - Less than $400(M2)'
  },
  {
    [STATUTE]: '22-30A-3',
    [DESCRIPTION]: 'Theft by Deception less than $1000(M2)'
  },
  {
    [STATUTE]: '22-30A-4',
    [DESCRIPTION]: 'Theft by Threat Extortion $0 - $400 (2)(M2)'
  },
  {
    [STATUTE]: '22-30A-4',
    [DESCRIPTION]: 'Theft by Threat Extortion $0 - $400 (3)(M2)'
  },
  {
    [STATUTE]: '22-30A-4',
    [DESCRIPTION]: 'Theft by Threat Extortion $0-$400 (4)(M2)'
  },
  {
    [STATUTE]: '22-30A-4',
    [DESCRIPTION]: 'Theft by Threat Extortion $0 - $400 (5)(M2)'
  },
  {
    [STATUTE]: '22-30A-4',
    [DESCRIPTION]: 'Theft by Threat Extortion $0 - $400 (6)(M2)'
  },
  {
    [STATUTE]: '22-30A-4',
    [DESCRIPTION]: 'Theft by Threat Extortion $0 - $400 (7)(M2)'
  },
  {
    [STATUTE]: '22-30A-4',
    [DESCRIPTION]: 'Theft by Threat Extortion $0 - $400(M2)'
  },
  {
    [STATUTE]: '22-30A-6',
    [DESCRIPTION]: 'Theft of Lost or Mislaid Property $0 - $400(M2)'
  },
  {
    [STATUTE]: '22-30A-7',
    [DESCRIPTION]: 'Receiving Stolen Property Less $400 (M2)'
  },
  {
    [STATUTE]: '22-30A-8',
    [DESCRIPTION]: 'Theft-Shoplifting OPWP/OSWP(M2)'
  },
  {
    [STATUTE]: '22-30A-8.1',
    [DESCRIPTION]: 'Use of Fraudulent Credit Card to Obtain Property or Services $401-$1000 (M2)'
  },
  {
    [STATUTE]: '22-30A-9',
    [DESCRIPTION]: 'Theft - Diverting Services of Another (M2)'
  },
  {
    [STATUTE]: '22-3-3',
    [DESCRIPTION]: 'Aiding, Abetting or Advising (M2)'
  },
  {
    [STATUTE]: '22-34-1',
    [DESCRIPTION]: 'Intentional Damage to Private Property $0-$400 (M2)'
  },
  {
    [STATUTE]: '22-34-1',
    [DESCRIPTION]: 'Intentional Damage to Property $400 or less - 3rd Degree Vandalism(M2)'
  },
  {
    [STATUTE]: '22-34-1',
    [DESCRIPTION]: 'Intentional Damage to Public Property $0-$400 (M2)'
  },
  {
    [STATUTE]: '22-34-1',
    [DESCRIPTION]: 'Intentional Damage to Private Property in Jail $0-$400(M2)'
  },
  {
    [STATUTE]: '22-34-1',
    [DESCRIPTION]: 'Intentional Damage to Public Property in Jail $0-$400(M2)'
  },
  {
    [STATUTE]: '22-35-5',
    [DESCRIPTION]: 'Enter or Remain in Building - Unlawful Occupancy (M1)'
  },
  {
    [STATUTE]: '22-35-6',
    [DESCRIPTION]: 'Failure to Vacate/Ordered to Leave (M1)'
  },
  {
    [STATUTE]: '22-35-6',
    [DESCRIPTION]: 'Trespassing on Premises (M1)'
  },
  {
    [STATUTE]: '22-35-6',
    [DESCRIPTION]: 'Trespassing on Premises (M2)'
  },
  {
    [STATUTE]: '22-3-8',
    [DESCRIPTION]: 'Conspiracy To Commit A Misdemeanor (M2)'
  },
  {
    [STATUTE]: '22-40-16',
    [DESCRIPTION]: 'Impersonation of Public Official or Employee Causing Injury or Fraud(M2)'
  },
  {
    [STATUTE]: '22-41-14',
    [DESCRIPTION]: 'Fraud-Misrepresentation by Manufacture/Dealer (DO NOT USE - REPEALED)'
  },
  {
    [STATUTE]: '22-42-15',
    [DESCRIPTION]: 'Ingesting Substance Excluding Alcohol/To Intoxicate (Drugs)(M1)'
  },
  {
    [STATUTE]: '22-42-15',
    [DESCRIPTION]: 'Ingesting Substance Exluding Alcohol/To Intoxicate (Non-Drug)(M1)'
  },
  {
    [STATUTE]: '22-42-6',
    [DESCRIPTION]: 'Possession of Marijuana 2 oz or less (M1)'
  },
  {
    [STATUTE]: '22-42-6',
    [DESCRIPTION]: 'Possession of Marijuana in a Motor Vehicle(M1)'
  },
  {
    [STATUTE]: '22-42A-3',
    [DESCRIPTION]: 'Possession or Use Drug Paraphernalia by Driver(M2)'
  },
  {
    [STATUTE]: '22-42A-3',
    [DESCRIPTION]: 'Possession or Use Drug Paraphernalia in MV(M2)'
  },
  {
    [STATUTE]: '22-42A-3',
    [DESCRIPTION]: 'Possession or Use Drug Paraphernalia(M2)'
  },
  {
    [STATUTE]: '22-44-2',
    [DESCRIPTION]: 'Possession of Equipment for Receiving Services Without Payment'
  },
  {
    [STATUTE]: '23-1A-9',
    [DESCRIPTION]: 'Failure to Supply Info on Petty Offense(M2)'
  },
  {
    [STATUTE]: '3.06.01',
    [DESCRIPTION]: 'County - Animal Nuisance (Hill City) (M2)'
  },
  {
    [STATUTE]: '31-15-94',
    [DESCRIPTION]: 'Unlawful Use of Median (DO NOT USE)'
  },
  {
    [STATUTE]: '31-28-19',
    [DESCRIPTION]: 'Offcial Signs - Markings or Obscuring(M2)'
  },
  {
    [STATUTE]: '31-32-7',
    [DESCRIPTION]: 'Destruction, Etc., of Highway Grade or Ditch(M2)'
  },
  {
    [STATUTE]: '31-4-14.3',
    [DESCRIPTION]: 'Traveling Through Closed Road Signs on State Highway (M2)'
  },
  {
    [STATUTE]: '31-8-15',
    [DESCRIPTION]: 'Driving Wrong Way on Interstate or Improper Turns(M2)'
  },
  {
    [STATUTE]: '32-10-34',
    [DESCRIPTION]: 'IRP Poss. of Registration Documents Required(M2)'
  },
  {
    [STATUTE]: '32-12-11',
    [DESCRIPTION]: 'Violation of Learner\'s Permit by person at least fourteen but less than eighteen(M2)'
  },
  {
    [STATUTE]: '32-12-17.3',
    [DESCRIPTION]: 'Display or Possession of Altered or Fictitious ID Card (M1)'
  },
  {
    [STATUTE]: '32-12-18',
    [DESCRIPTION]: 'Possession of More Than One Drivers License(M2)'
  },
  {
    [STATUTE]: '32-12-22',
    [DESCRIPTION]: 'Driving Without Valid License or Permit(M2)'
  },
  {
    [STATUTE]: '32-12-26.1',
    [DESCRIPTION]: 'Fail to Obtain South Dakota Drivers License Within 90 Days(M2)'
  },
  {
    [STATUTE]: '32-12-3.1',
    [DESCRIPTION]: 'Identification to be Submitted With Application(M2)'
  },
  {
    [STATUTE]: '32-12-38',
    [DESCRIPTION]: 'DL Restriction Violation'
  },
  {
    [STATUTE]: '32-12-39',
    [DESCRIPTION]: 'Driver\'s License Not In Possession'
  },
  {
    [STATUTE]: '32-12-41',
    [DESCRIPTION]: 'Lost or Destroyed License-Issuance of Duplicate'
  },
  {
    [STATUTE]: '32-12-52.4',
    [DESCRIPTION]: 'Possession of Alcohol in Motor Vehicle by Minor (M2)'
  },
  {
    [STATUTE]: '32-12-65',
    [DESCRIPTION]: 'Driving Under Cancelled Driver\'s License (M2)'
  },
  {
    [STATUTE]: '32-12-65',
    [DESCRIPTION]: 'Driving Under Revocation (M1)'
  },
  {
    [STATUTE]: '32-12-65',
    [DESCRIPTION]: 'Driving Under Suspension (M2)'
  },
  {
    [STATUTE]: '32-12-65 (2)',
    [DESCRIPTION]: 'Driving Under Suspension (M2)'
  },
  {
    [STATUTE]: '32-12-67',
    [DESCRIPTION]: 'Possession of Revoked, Altered or Fictitious Driver\'s License (M1)'
  },
  {
    [STATUTE]: '32-12-69',
    [DESCRIPTION]: 'Permitting Unlawful Use of Drivers License (M1)'
  },
  {
    [STATUTE]: '32-12-70',
    [DESCRIPTION]: 'Display or Represent Others License as Your Own (M1)'
  },
  {
    [STATUTE]: '32-12-71',
    [DESCRIPTION]: 'Lend or Permit Use of Your Drivers License by Another (M1)'
  },
  {
    [STATUTE]: '32-12-72',
    [DESCRIPTION]: 'Allow Unauthorized Driver to Operate Vehicle(M2)'
  },
  {
    [STATUTE]: '32-12-73',
    [DESCRIPTION]: 'Permitting Unauthorized Minor to Use Vehicle (M2)'
  },
  {
    [STATUTE]: '32-12-73',
    [DESCRIPTION]: 'Permitting Unauthorized Minor to Use Vehicle (M2)'
  },
  {
    [STATUTE]: '32-12-74',
    [DESCRIPTION]: 'Violation of Restrictions on License(M2)'
  },
  {
    [STATUTE]: '32-12-75.2',
    [DESCRIPTION]: 'Counterfeiting, Forging, or Altering any DL or ID(M2)'
  },
  {
    [STATUTE]: '32-12A-43',
    [DESCRIPTION]: 'Operating Commercial Vehicle w/Any Alcohol In System (M2)'
  },
  {
    [STATUTE]: '32-12A-44',
    [DESCRIPTION]: 'Operate Commercial Vehicle Between .04 to .08% (M2)'
  },
  {
    [STATUTE]: '32-12A-6',
    [DESCRIPTION]: 'Possession of Commercial Driver\'s License Required(M2)'
  },
  {
    [STATUTE]: '32-14-15',
    [DESCRIPTION]: 'Operation of a Golf Cart on State/County Highway'
  },
  {
    [STATUTE]: '32-14-5',
    [DESCRIPTION]: 'Status Wrong Way on One Way Street(M2)'
  },
  {
    [STATUTE]: '32-14-7',
    [DESCRIPTION]: 'Driving Off Truck Route'
  },
  {
    [STATUTE]: '32-14-9.1',
    [DESCRIPTION]: 'Operate Vehicle on Private Property without Permission (M2)'
  },
  {
    [STATUTE]: '32-15-1',
    [DESCRIPTION]: 'Registration of Vehicle without Safety Glass as Petty Offense'
  },
  {
    [STATUTE]: '32-15-10',
    [DESCRIPTION]: 'Horn Required'
  },
  {
    [STATUTE]: '32-15-10',
    [DESCRIPTION]: 'Horn Required'
  },
  {
    [STATUTE]: '32-15-11',
    [DESCRIPTION]: 'Sirens, Whistles and Loud Noises on Vehicles(M2)'
  },
  {
    [STATUTE]: '32-15-11',
    [DESCRIPTION]: 'Sirens, Whistles and Loud Noises on Vehicles(M2)'
  },
  {
    [STATUTE]: '32-15-13',
    [DESCRIPTION]: 'Directional Turn Signals Required (Exc. MC/Agricultural Vehicles)(M2)'
  },
  {
    [STATUTE]: '32-15-13',
    [DESCRIPTION]: 'Directional Turn Signals Required (Exc. MC/Agricultural Vehicles)(M2)'
  },
  {
    [STATUTE]: '32-15-17',
    [DESCRIPTION]: 'Improper Muffler or Exhaust System(M2)'
  },
  {
    [STATUTE]: '32-15-17',
    [DESCRIPTION]: 'Improper Muffler or Exhaust System(M2)'
  },
  {
    [STATUTE]: '32-15-18',
    [DESCRIPTION]: 'Driving Improperly Loaded Vehicle (M2)'
  },
  {
    [STATUTE]: '32-15-18',
    [DESCRIPTION]: 'Driving Improperly Loaded Vehicle (M2)'
  },
  {
    [STATUTE]: '32-15-2',
    [DESCRIPTION]: 'Replacement With Material Other Than Safety Glass'
  },
  {
    [STATUTE]: '32-15-2.1',
    [DESCRIPTION]: 'No Windshield/Laminated Windshield Required'
  },
  {
    [STATUTE]: '32-15-2.2',
    [DESCRIPTION]: 'Cracked or Broken Glass Prohibited(M2)'
  },
  {
    [STATUTE]: '32-15-2.3',
    [DESCRIPTION]: 'Windshield - Cracked, Broken or Distorted Glass Prohibited'
  },
  {
    [STATUTE]: '32-15-2.4',
    [DESCRIPTION]: 'Illegal Window Tint Front Side and Windshield 35%(M2)'
  },
  {
    [STATUTE]: '32-15-2.5',
    [DESCRIPTION]: 'Illegal Window Tint Rear Side and Back 20%(M2)'
  },
  {
    [STATUTE]: '32-15-2.9',
    [DESCRIPTION]: 'Sunscreening Devices on Windshield Prohibited(M2)'
  },
  {
    [STATUTE]: '32-15-20',
    [DESCRIPTION]: 'Fail to Display Slow Moving Vehicle Emblem'
  },
  {
    [STATUTE]: '32-15-22',
    [DESCRIPTION]: 'Misuse of Slow-Moving Vehicle Emblem'
  },
  {
    [STATUTE]: '32-15-22',
    [DESCRIPTION]: 'Misuse of Slow-Moving Vehicle Emblem'
  },
  {
    [STATUTE]: '32-15-27',
    [DESCRIPTION]: 'Wheel weight, movement, and damping device requirements for vehicle suspension'
  },
  {
    [STATUTE]: '32-15-28',
    [DESCRIPTION]: 'Improperly Adjusted Steering'
  },
  {
    [STATUTE]: '32-15-32',
    [DESCRIPTION]: 'Door Levers, Handles, and Devices of Egress-Hood Latches'
  },
  {
    [STATUTE]: '32-15-34',
    [DESCRIPTION]: 'Disconnected Odometer(M2)'
  },
  {
    [STATUTE]: '32-15-5',
    [DESCRIPTION]: 'Obstructed Windshield or Windows'
  },
  {
    [STATUTE]: '32-15-6',
    [DESCRIPTION]: 'Dangling Objects'
  },
  {
    [STATUTE]: '32-15-7',
    [DESCRIPTION]: 'Windshield Wipers Required'
  },
  {
    [STATUTE]: '32-15-8',
    [DESCRIPTION]: 'No Rearview Mirror on Vehicle'
  },
  {
    [STATUTE]: '32-15-9',
    [DESCRIPTION]: 'Television Visable to Driver Prohibited'
  },
  {
    [STATUTE]: '32-17-1',
    [DESCRIPTION]: 'Motor Vehicles Required to Have Headlights'
  },
  {
    [STATUTE]: '32-17-11',
    [DESCRIPTION]: 'Improper Lighting of License Plate'
  },
  {
    [STATUTE]: '32-17-12',
    [DESCRIPTION]: 'Rear Reflector Required'
  },
  {
    [STATUTE]: '32-17-13',
    [DESCRIPTION]: 'Mounting of Relectors'
  },
  {
    [STATUTE]: '32-17-14',
    [DESCRIPTION]: 'Vehicles requiring clearance lamps--Location and visibility of clearance lamps--Violation as petty offense'
  },
  {
    [STATUTE]: '32-17-15',
    [DESCRIPTION]: 'Vehicles requiring identification lamps--Mounting and spacing of identification lamps--Visibility--Violation as petty offense'
  },
  {
    [STATUTE]: '32-17-17',
    [DESCRIPTION]: 'Requirements of Auxillary Driving Lamps'
  },
  {
    [STATUTE]: '32-17-17',
    [DESCRIPTION]: 'Using Auxillary lamps While on Low Beam(M2)'
  },
  {
    [STATUTE]: '32-17-18',
    [DESCRIPTION]: 'Turn Signal Req/Visibility'
  },
  {
    [STATUTE]: '32-17-19',
    [DESCRIPTION]: 'Spot Lamp - Aiming and Adjusting(M2)'
  },
  {
    [STATUTE]: '32-17-20',
    [DESCRIPTION]: 'Driving With Fog Lights On(M2)'
  },
  {
    [STATUTE]: '32-17-24',
    [DESCRIPTION]: 'Headlamps Required on Motorcycle'
  },
  {
    [STATUTE]: '32-17-25',
    [DESCRIPTION]: 'Bicycle - No Lamps'
  },
  {
    [STATUTE]: '32-17-28',
    [DESCRIPTION]: 'Vehicles Required to be Equipped with Portable Flares, Lights or Reflectors - Visability(M2)'
  },
  {
    [STATUTE]: '32-17-4',
    [DESCRIPTION]: 'Driving Without Headlights(M2)'
  },
  {
    [STATUTE]: '32-17-42',
    [DESCRIPTION]: 'Blue Lights or Strobe Lights on Firemen\'s Vehicles(M2)'
  },
  {
    [STATUTE]: '32-17-5',
    [DESCRIPTION]: 'Headlight Adjustment/Construction(M2)'
  },
  {
    [STATUTE]: '32-17-6',
    [DESCRIPTION]: 'Headlamps Improperly Adjusted(M2)'
  },
  {
    [STATUTE]: '32-17-7',
    [DESCRIPTION]: 'Fail to Dim Headlights(M2)'
  },
  {
    [STATUTE]: '32-17-8',
    [DESCRIPTION]: 'Rear Lamps Required-Height of Mounting'
  },
  {
    [STATUTE]: '32-17-8.1',
    [DESCRIPTION]: 'Stop Lamps Required'
  },
  {
    [STATUTE]: '32-17-9',
    [DESCRIPTION]: 'Red Lights on Front Of Vehicle Prohibited(M2)'
  },
  {
    [STATUTE]: '32-18-1',
    [DESCRIPTION]: 'Brakes Required on Vehicles(M2)'
  },
  {
    [STATUTE]: '32-18-13',
    [DESCRIPTION]: 'Parking Brakes to Secure Parked Vehicle(M2)'
  },
  {
    [STATUTE]: '32-18-17',
    [DESCRIPTION]: 'Trailers with Air or Vacuum Brakes--Automatic continuing operation(M2)'
  },
  {
    [STATUTE]: '32-18-18',
    [DESCRIPTION]: 'Brakes on Towing Vehicle in Case Towed Vehicle Breaks Away(M2)'
  },
  {
    [STATUTE]: '32-18-26',
    [DESCRIPTION]: 'Improperly Maintained/Adjusted Brakes(M2)'
  },
  {
    [STATUTE]: '32-19-1',
    [DESCRIPTION]: 'Solid rubber tire vehicles--Tire requirements'
  },
  {
    [STATUTE]: '32-19-10',
    [DESCRIPTION]: 'Safety Chain Slack and Coupling(M2)'
  },
  {
    [STATUTE]: '32-19-12',
    [DESCRIPTION]: 'Operate Vehicle Unsafe Wheel(M2)'
  },
  {
    [STATUTE]: '32-19-13',
    [DESCRIPTION]: 'Operate M/V with Cut or Worn Tires(M2)'
  },
  {
    [STATUTE]: '32-19-3',
    [DESCRIPTION]: 'Studded Tires not Allowed 5/1 to 9/30(M2)'
  },
  {
    [STATUTE]: '32-19-7',
    [DESCRIPTION]: 'Improper Towing Connection(M2)'
  },
  {
    [STATUTE]: '32-19-9',
    [DESCRIPTION]: 'Improperly Secured Trailer; No Safety Chains(M2)'
  },
  {
    [STATUTE]: '32-20-12',
    [DESCRIPTION]: 'Operating Offroad Vehicle/Operation on Certain Lands(M2)'
  },
  {
    [STATUTE]: '32-20-13',
    [DESCRIPTION]: 'ATV Licensed as Motorcycle Prohibited on Interstate(M2)'
  },
  {
    [STATUTE]: '32-20-2',
    [DESCRIPTION]: 'No Motorcycle Endorsement (M2)'
  },
  {
    [STATUTE]: '32-20-3',
    [DESCRIPTION]: 'Handlebar Height Requirements (PO)'
  },
  {
    [STATUTE]: '32-20-4',
    [DESCRIPTION]: 'Minor Riding on Motorcycle Without Helmet (Under 18 Years Old)(M2)'
  },
  {
    [STATUTE]: '32-20-4.1',
    [DESCRIPTION]: 'No Eye Protection on a Motorcycle'
  },
  {
    [STATUTE]: '32-20-6.1',
    [DESCRIPTION]: 'Operating Motorcycle With More Than 2 Passengers(M2)'
  },
  {
    [STATUTE]: '32-20-6.2',
    [DESCRIPTION]: 'Position of Motorcyclist (M2)'
  },
  {
    [STATUTE]: '32-20-6.3',
    [DESCRIPTION]: 'Carrying Package on Motorcycle (M2)'
  },
  {
    [STATUTE]: '32-20-6.4',
    [DESCRIPTION]: 'Rider Interfering with Control or View of Operator (M2)'
  },
  {
    [STATUTE]: '32-20-6.5',
    [DESCRIPTION]: 'Attachment to Other Vehicles Prohibited (M2)'
  },
  {
    [STATUTE]: '32-20-6.6',
    [DESCRIPTION]: 'Weapons-Carrying Firearm on Motorcycle or Off-Road Vehicle (Unless They Have a Permit) (M2)'
  },
  {
    [STATUTE]: '32-20-9.1',
    [DESCRIPTION]: 'Motorcycle Entitled to Full Traffic Lane (M2)'
  },
  {
    [STATUTE]: '32-20-9.2',
    [DESCRIPTION]: 'Improper Passing by Motorcycle (M2)'
  },
  {
    [STATUTE]: '32-20-9.3',
    [DESCRIPTION]: 'Motorcycle Operation Between Lanes Prohibited (M2)'
  },
  {
    [STATUTE]: '32-20-9.5',
    [DESCRIPTION]: 'Motorcycle - Driving More than Two Abreast in Same Lane (M2)'
  },
  {
    [STATUTE]: '32-20A-10',
    [DESCRIPTION]: 'Snowmobile-Light Required when Dark(M2)'
  },
  {
    [STATUTE]: '32-20A-11',
    [DESCRIPTION]: 'Snowmobile-Restriction on Carrying of Firearms(M2)'
  },
  {
    [STATUTE]: '32-20A-15',
    [DESCRIPTION]: 'Snowmobile-No Registration, License or Titling(M2)'
  },
  {
    [STATUTE]: '32-20A-19',
    [DESCRIPTION]: 'Snowmobile Accident Not Reported(M2)'
  },
  {
    [STATUTE]: '32-20A-2',
    [DESCRIPTION]: 'Snowmobile-Speeding and Reckless/Muffler Required(M2)'
  },
  {
    [STATUTE]: '32-20A-3',
    [DESCRIPTION]: 'Snowmobile-Age Restriction on Driver(M2)'
  },
  {
    [STATUTE]: '32-20A-5',
    [DESCRIPTION]: 'Snowmobile-Restriction of Use on Interstate HIghways and Railroads(M2)'
  },
  {
    [STATUTE]: '32-20A-7',
    [DESCRIPTION]: 'Snowmobile-Conditions Permitting Operation on Roadways(M2)'
  },
  {
    [STATUTE]: '32-20B-2',
    [DESCRIPTION]: 'Bicycle-Failure to Stop Before Entering Intersection or Crosswalk(M2)'
  },
  {
    [STATUTE]: '32-20B-3',
    [DESCRIPTION]: 'Bicycle-Fail to Yield Right-of-Way to Pedestrian (M2)'
  },
  {
    [STATUTE]: '32-20B-4',
    [DESCRIPTION]: 'Bicycle-Parking on Sidewalk'
  },
  {
    [STATUTE]: '32-20B-5',
    [DESCRIPTION]: 'Bicycle-Operation on Roadway/Riding Close to Right-Hand Curb Required(M2)'
  },
  {
    [STATUTE]: '32-21-27',
    [DESCRIPTION]: 'Operating Unsafe Motor Vehicle(M2)'
  },
  {
    [STATUTE]: '32-21-3.1',
    [DESCRIPTION]: 'Annual Inspection of Large Passenger Vehicle Used by Nonprofit Organization(M2)'
  },
  {
    [STATUTE]: '32-21-30',
    [DESCRIPTION]: 'Failure to Return Warning Ticket(M2)'
  },
  {
    [STATUTE]: '32-22-12.1',
    [DESCRIPTION]: 'Certain Combinations Exempt(M2)'
  },
  {
    [STATUTE]: '32-22-12.2',
    [DESCRIPTION]: 'Improperly TowingTwo Anhydrous Ammonia Fetilizer Tanks(M2)'
  },
  {
    [STATUTE]: '32-22-14',
    [DESCRIPTION]: 'Maximum Height of Vehicles--Farm and Fire Vehicles Excepted--Trailers Carrying Baled Hay(M2)'
  },
  {
    [STATUTE]: '32-22-16',
    [DESCRIPTION]: 'Overweight Vehicles(M2)'
  },
  {
    [STATUTE]: '32-22-16.3',
    [DESCRIPTION]: 'Overweight Agricultural Vehicles(M2)'
  },
  {
    [STATUTE]: '32-22-2',
    [DESCRIPTION]: 'Movement of Load or Wide Farm Machinery During Darkness (M2)'
  },
  {
    [STATUTE]: '32-22-21',
    [DESCRIPTION]: 'Maximum Weight Per Tire--Spacing of Axles--Violation as misdemeanor(M2)'
  },
  {
    [STATUTE]: '32-22-24',
    [DESCRIPTION]: 'Reduced Load Maximums February 15 - April 13--Extension of Period--Changing Restrictions--Overweight Permits(M2)'
  },
  {
    [STATUTE]: '32-22-25',
    [DESCRIPTION]: 'Overweight Vehicle on Specified Road Weight Limits(M2)'
  },
  {
    [STATUTE]: '32-22-3',
    [DESCRIPTION]: 'Maximum Width of Vehicle and Load--Violation as Misdemeanor--Farm Machinery and Recreation Vehicle Exceptions(M2)'
  },
  {
    [STATUTE]: '32-22-41',
    [DESCRIPTION]: 'Oversize Permits--Duration(M2)'
  },
  {
    [STATUTE]: '32-22-42.10',
    [DESCRIPTION]: 'Solid Waste Hauling Vehicle Weight Restrictions(M2)'
  },
  {
    [STATUTE]: '32-22-42.2',
    [DESCRIPTION]: 'Overweight Harvest Vehicle(M2)'
  },
  {
    [STATUTE]: '32-22-48',
    [DESCRIPTION]: 'Over Weight on Posted Bridge(M2)'
  },
  {
    [STATUTE]: '32-22-52',
    [DESCRIPTION]: 'Operate Overweight or Oversize Vehicle or Allow Operation(M2)'
  },
  {
    [STATUTE]: '32-22-57',
    [DESCRIPTION]: 'Lift Axle Control Requirements--Permits(M2)'
  },
  {
    [STATUTE]: '32-22-57.1',
    [DESCRIPTION]: 'Vehicle Equipped with Variable Load Axle to be Equipped with Pressure Control Device(M2)'
  },
  {
    [STATUTE]: '32-22-6',
    [DESCRIPTION]: 'Failure to Flag or Light Extended Load (M2)'
  },
  {
    [STATUTE]: '32-22-8.1',
    [DESCRIPTION]: 'Length Limitations on Trailers, Semitrailers and Auto/Boat Transporters(M2)'
  },
  {
    [STATUTE]: '32-23-1',
    [DESCRIPTION]: 'DUI 1st Offense (M1)'
  },
  {
    [STATUTE]: '32-23-1.2',
    [DESCRIPTION]: 'Failure to Take PBT When Involved in Accident (M2)'
  },
  {
    [STATUTE]: '32-23-21',
    [DESCRIPTION]: 'Zero Tolerance DUI / Consume Alcohol or any Drug Under 21 (M2)'
  },
  {
    [STATUTE]: '32-24-2',
    [DESCRIPTION]: 'Coasting Downhill In Neutral or With Clutch Out (Repealed-Do Not Use)'
  },
  {
    [STATUTE]: '32-24-8',
    [DESCRIPTION]: 'Careless Driving (M2)'
  },
  {
    [STATUTE]: '32-24-9',
    [DESCRIPTION]: 'Exhibition Driving (M2)'
  },
  {
    [STATUTE]: '32-25-1.1',
    [DESCRIPTION]: 'Maximum Daytime Speed(M2)'
  },
  {
    [STATUTE]: '32-25-1.1',
    [DESCRIPTION]: 'Speeding on State Highway (01-05 MPH Over Limit)(M2)'
  },
  {
    [STATUTE]: '32-25-1.1',
    [DESCRIPTION]: 'Speeding on State Highway (06-10 MPH Over Limit)(M2)'
  },
  {
    [STATUTE]: '32-25-1.1',
    [DESCRIPTION]: 'Speeding on State Highway (11-15 MPH Over Limit)(M2)'
  },
  {
    [STATUTE]: '32-25-1.1',
    [DESCRIPTION]: 'Speeding on State Highway (16-20 MPH Over Limit)(M2)'
  },
  {
    [STATUTE]: '32-25-1.1',
    [DESCRIPTION]: 'Speeding on State Highway (21-25 MPH Over Limit)(M2)'
  },
  {
    [STATUTE]: '32-25-1.1',
    [DESCRIPTION]: 'Speeding on State Highway (26+ Over Limit)(M2)'
  },
  {
    [STATUTE]: '32-25-12',
    [DESCRIPTION]: 'Speed Limit in Unposted Urban Areas(M2)'
  },
  {
    [STATUTE]: '32-25-14',
    [DESCRIPTION]: 'Speeding in a School  Zone (21-25 MPH Over Limit)(M2)'
  },
  {
    [STATUTE]: '32-25-14',
    [DESCRIPTION]: 'Speeding in a School Zone (01-05 MPH Over Limit)(M2)'
  },
  {
    [STATUTE]: '32-25-14',
    [DESCRIPTION]: 'Speeding in a School Zone (06-10 MPH Over Limit)(M2)'
  },
  {
    [STATUTE]: '32-25-14',
    [DESCRIPTION]: 'Speeding in a School Zone (11-15 MPH Over Limit)(M2)'
  },
  {
    [STATUTE]: '32-25-14',
    [DESCRIPTION]: 'Speeding in a School Zone (16-20 MPH Over Limit)(M2)'
  },
  {
    [STATUTE]: '32-25-14',
    [DESCRIPTION]: 'Speeding in a School Zone (26+ MPH Over Limit)(M2)'
  },
  {
    [STATUTE]: '32-25-14',
    [DESCRIPTION]: 'Speeding in a School Zone(M2)'
  },
  {
    [STATUTE]: '32-25-15',
    [DESCRIPTION]: 'Maximum Speed at Obstructed View Intersection(M2)'
  },
  {
    [STATUTE]: '32-25-19.1',
    [DESCRIPTION]: 'Speeding/Construction Zone (01-05 MPH Over Limit)(M2)'
  },
  {
    [STATUTE]: '32-25-19.1',
    [DESCRIPTION]: 'Speeding/Construction Zone (06-10 MPH Over Limit)(M2)'
  },
  {
    [STATUTE]: '32-25-19.1',
    [DESCRIPTION]: 'Speeding/Construction Zone (11-15 MPH Over Limit)(M2)'
  },
  {
    [STATUTE]: '32-25-19.1',
    [DESCRIPTION]: 'Speeding/Construction Zone (16-20 MPH Over Limit)(M2)'
  },
  {
    [STATUTE]: '32-25-19.1',
    [DESCRIPTION]: 'Speeding/Construction Zone (21-25 MPH Over Limit)(M2)'
  },
  {
    [STATUTE]: '32-25-19.1',
    [DESCRIPTION]: 'Speeding/Construction Zone (26+ Over Limit)(M2)'
  },
  {
    [STATUTE]: '32-25-19.1',
    [DESCRIPTION]: 'Speeding/Construction Zone(M2)'
  },
  {
    [STATUTE]: '32-25-23',
    [DESCRIPTION]: 'Drag Racing on Highway (M2)'
  },
  {
    [STATUTE]: '32-25-3',
    [DESCRIPTION]: 'Overdriving Road Conditions (M2)'
  },
  {
    [STATUTE]: '32-25-4',
    [DESCRIPTION]: 'Maximum Speeds on Interstate Highways(M2)'
  },
  {
    [STATUTE]: '32-25-4',
    [DESCRIPTION]: 'Speeding on Interstate (01-05 MPH Over Limit)(M2)'
  },
  {
    [STATUTE]: '32-25-4',
    [DESCRIPTION]: 'Speeding on Interstate (06-10 MPH Over Limit)(M2)'
  },
  {
    [STATUTE]: '32-25-4',
    [DESCRIPTION]: 'Speeding on Interstate (11-15 MPH Over Limit)(M2)'
  },
  {
    [STATUTE]: '32-25-4',
    [DESCRIPTION]: 'Speeding on Interstate (16-20 MPH Over Limit)(M2)'
  },
  {
    [STATUTE]: '32-25-4',
    [DESCRIPTION]: 'Speeding on Interstate (21-25 MPH Over Limit)(M2)'
  },
  {
    [STATUTE]: '32-25-4',
    [DESCRIPTION]: 'Speeding on Interstate (26+ MPH Over Limit)(M2)'
  },
  {
    [STATUTE]: '32-25-5',
    [DESCRIPTION]: 'Minimum Speed on Interstate - 40 MPH(M2)'
  },
  {
    [STATUTE]: '32-25-5.1',
    [DESCRIPTION]: 'Unreasonably Slow Speed Prohibited(M2)'
  },
  {
    [STATUTE]: '32-25-7',
    [DESCRIPTION]: 'Speeding Obey Speed Limits(M2)'
  },
  {
    [STATUTE]: '32-25-7',
    [DESCRIPTION]: 'Speeding Other Roadways (01-05 MPH Over Limit)(M2)'
  },
  {
    [STATUTE]: '32-25-7',
    [DESCRIPTION]: 'Speeding Other Roadways (06-10 MPH Over Limit)(M2)'
  },
  {
    [STATUTE]: '32-25-7',
    [DESCRIPTION]: 'Speeding Other Roadways (11-15 MPH Over Limit)(M2)'
  },
  {
    [STATUTE]: '32-25-7',
    [DESCRIPTION]: 'Speeding Other Roadways (16-20 MPH Over Limit)(M2)'
  },
  {
    [STATUTE]: '32-25-7',
    [DESCRIPTION]: 'Speeding Other Roadways (21-25 MPH Over Limit)(M2)'
  },
  {
    [STATUTE]: '32-25-7',
    [DESCRIPTION]: 'Speeding Other Roadways (26+ Over Limit)(M2)'
  },
  {
    [STATUTE]: '32-25-7.1',
    [DESCRIPTION]: 'Speeding on Divided  Highway (01-05 MPH)(M2)'
  },
  {
    [STATUTE]: '32-25-7.1',
    [DESCRIPTION]: 'Speeding on Divided  Highway (11-15 MPH)(M2)'
  },
  {
    [STATUTE]: '32-25-7.1',
    [DESCRIPTION]: 'Speeding on Divided  Highway (16-20 MPH)(M2)'
  },
  {
    [STATUTE]: '32-25-7.1',
    [DESCRIPTION]: 'Speeding on Divided  Highway (21-25 MPH)(M2)'
  },
  {
    [STATUTE]: '32-25-7.1',
    [DESCRIPTION]: 'Speeding on Divided  Highway (26 MPH and Up)(M2)'
  },
  {
    [STATUTE]: '32-25-7.1',
    [DESCRIPTION]: 'Speeding on Divided Highway (06-10 MPH)(M2)'
  },
  {
    [STATUTE]: '32-25-7.1',
    [DESCRIPTION]: 'Maximum Speeds on Designated 4-lane Rural Highways(M2)'
  },
  {
    [STATUTE]: '32-25-9.2',
    [DESCRIPTION]: 'Speeding Township Roads 55 MPH(M2)'
  },
  {
    [STATUTE]: '32-26-1',
    [DESCRIPTION]: 'Driving on Wrong Side of Road (M2)'
  },
  {
    [STATUTE]: '32-26-10',
    [DESCRIPTION]: 'Unlawfully Entering/Leaving Controlled Access Highway (M2)'
  },
  {
    [STATUTE]: '32-26-11',
    [DESCRIPTION]: 'Disobeying Signs Prohibiting Certain Traffic on Controlled Access Highways(M2)'
  },
  {
    [STATUTE]: '32-26-13',
    [DESCRIPTION]: 'Fail to Yield Right Of Way At Intersection (M2)'
  },
  {
    [STATUTE]: '32-26-14',
    [DESCRIPTION]: 'Failure to Yield Right of Way From Alley, Building or Private Road(M2)'
  },
  {
    [STATUTE]: '32-26-15',
    [DESCRIPTION]: 'Failure to Yield Right of Way to Emergency Vehicle(M2)'
  },
  {
    [STATUTE]: '32-26-16',
    [DESCRIPTION]: 'Failure to Yield to Highway Maintenance Vehicle(M2)'
  },
  {
    [STATUTE]: '32-26-17',
    [DESCRIPTION]: 'Improper Right Turn (M2)'
  },
  {
    [STATUTE]: '32-26-18',
    [DESCRIPTION]: 'Improper Left Turn (M2)'
  },
  {
    [STATUTE]: '32-26-18.1',
    [DESCRIPTION]: 'Turn From Wrong Lane Prohibited-Turn Signals Required (M2)'
  },
  {
    [STATUTE]: '32-26-19',
    [DESCRIPTION]: 'Failure to Yield(M2)'
  },
  {
    [STATUTE]: '32-26-20',
    [DESCRIPTION]: 'Failure to Turn Properly(M2)'
  },
  {
    [STATUTE]: '32-26-21.1',
    [DESCRIPTION]: 'Driving On SideWalk Prohibited (M2)'
  },
  {
    [STATUTE]: '32-26-22',
    [DESCRIPTION]: 'Visible Audible Signals to Warn of Movement(M2)'
  },
  {
    [STATUTE]: '32-26-22.1',
    [DESCRIPTION]: 'Improper Use of Signals-Stopping or Slowing Signal Required (M2)'
  },
  {
    [STATUTE]: '32-26-23',
    [DESCRIPTION]: 'Signals Usage(M2)'
  },
  {
    [STATUTE]: '32-26-25',
    [DESCRIPTION]: 'Illegal U-Turn (M2)'
  },
  {
    [STATUTE]: '32-26-26',
    [DESCRIPTION]: 'Improper Overtaking(M2)'
  },
  {
    [STATUTE]: '32-26-27',
    [DESCRIPTION]: 'Unsafe Lane Changing (Pass on Right) (M2)'
  },
  {
    [STATUTE]: '32-26-28',
    [DESCRIPTION]: 'Passing on Right Leaving Pavement (M2)'
  },
  {
    [STATUTE]: '32-26-3',
    [DESCRIPTION]: 'Improper Passing on Right (M2)'
  },
  {
    [STATUTE]: '32-26-30',
    [DESCRIPTION]: 'Passing in Business or Residential Area(M2)'
  },
  {
    [STATUTE]: '32-26-31',
    [DESCRIPTION]: 'Duty of Driver of Overtaken Vehicle(M2)'
  },
  {
    [STATUTE]: '32-26-34',
    [DESCRIPTION]: 'Passing When Vision is Obscured(M2)'
  },
  {
    [STATUTE]: '32-26-35',
    [DESCRIPTION]: 'Driving to Left on Grade or Curve-Obstructed View(M2)'
  },
  {
    [STATUTE]: '32-26-36',
    [DESCRIPTION]: 'Passing At Intersection, Railroad, Bridge or Tunnel (M2)'
  },
  {
    [STATUTE]: '32-26-37',
    [DESCRIPTION]: 'Passing in No Passing Zone (M2)'
  },
  {
    [STATUTE]: '32-26-39',
    [DESCRIPTION]: 'Passing in Zone Signed or Marked No Passing(M2)'
  },
  {
    [STATUTE]: '32-26-4',
    [DESCRIPTION]: 'Mountain Highways--Curves--Keep to Right(M2)'
  },
  {
    [STATUTE]: '32-26-40',
    [DESCRIPTION]: 'Following too Closely (M2)'
  },
  {
    [STATUTE]: '32-26-43',
    [DESCRIPTION]: 'More Than Maximum Number of Passengers in Front (M2)'
  },
  {
    [STATUTE]: '32-26-44',
    [DESCRIPTION]: 'Passenger Interferring With Driver\'s View/Control (M2)'
  },
  {
    [STATUTE]: '32-26-47',
    [DESCRIPTION]: 'Texting or Certain Uses of Handheld Devices Prohibited While Driving'
  },
  {
    [STATUTE]: '32-26-6',
    [DESCRIPTION]: 'Improper Lane Change (M2)'
  },
  {
    [STATUTE]: '32-26-7',
    [DESCRIPTION]: 'Three-Lane Highways--Overtaking and Passing'
  },
  {
    [STATUTE]: '32-26-8',
    [DESCRIPTION]: 'Obey Designation of Lane for Slow-Moving Traffic(M2)'
  },
  {
    [STATUTE]: '32-26-9',
    [DESCRIPTION]: 'Crossing a Physical Barrier or Median (M2)'
  },
  {
    [STATUTE]: '32-27-1',
    [DESCRIPTION]: 'Fail to Yield Right-of Way to Pedestrian Making Proper Crossing (PO)'
  },
  {
    [STATUTE]: '32-27-10',
    [DESCRIPTION]: 'Fail to Yield Right-of-Way to Persons Working on Highway (M2)'
  },
  {
    [STATUTE]: '32-27-2',
    [DESCRIPTION]: 'Fail to Yield to Pedestrian at Controlled Intersection (Vehicle)'
  },
  {
    [STATUTE]: '32-27-2',
    [DESCRIPTION]: 'Fail to Yield to Vehicle at Controlled Intersection (Pedestrian)'
  },
  {
    [STATUTE]: '32-27-4',
    [DESCRIPTION]: 'Jaywalking-Duty to Yield Right-of-Way to Vehicles (PO)'
  },
  {
    [STATUTE]: '32-27-5',
    [DESCRIPTION]: 'Highways without Sidewalks--Duty to Walk Facing Traffic'
  },
  {
    [STATUTE]: '32-27-7',
    [DESCRIPTION]: 'Fail To Stop For Person With Seeing Eye Dog or Cane (M2)'
  },
  {
    [STATUTE]: '32-28-10',
    [DESCRIPTION]: 'Failure to Obey Traffic Signal (M2)'
  },
  {
    [STATUTE]: '32-28-10',
    [DESCRIPTION]: 'Traffic Light Violation-School Crosswalk(M2)'
  },
  {
    [STATUTE]: '32-28-4',
    [DESCRIPTION]: 'Failure To Stop At Red Light - Prohibited Right Turn on Red (M2)'
  },
  {
    [STATUTE]: '32-28-6',
    [DESCRIPTION]: 'Violation of Flashing Red or Yellow Signal(M2)'
  },
  {
    [STATUTE]: '32-28-7',
    [DESCRIPTION]: 'Failure to Stop For Flashing Red Signal(M2)'
  },
  {
    [STATUTE]: '32-28-8',
    [DESCRIPTION]: 'Meaning of Flashing Yellow Signal(M2)'
  },
  {
    [STATUTE]: '32-28-8.2',
    [DESCRIPTION]: 'Procedure When Traffic Lights Malfunctioning(M2)'
  },
  {
    [STATUTE]: '32-28A-3',
    [DESCRIPTION]: 'Log Book Violation (Do Not Use)'
  },
  {
    [STATUTE]: '32-29-11',
    [DESCRIPTION]: 'Mandatory Brake Check(M2)'
  },
  {
    [STATUTE]: '32-29-2.1',
    [DESCRIPTION]: 'Stop Sign Violation(M2)'
  },
  {
    [STATUTE]: '32-29-2.2',
    [DESCRIPTION]: 'Stop From Alley, Bldg or Private Rd Before Enter Roadway(M2)'
  },
  {
    [STATUTE]: '32-29-3',
    [DESCRIPTION]: 'Failure to Obey Yield Sign(M2)'
  },
  {
    [STATUTE]: '32-29-4',
    [DESCRIPTION]: 'Fail To Stop At Railroad Crossing(M2)'
  },
  {
    [STATUTE]: '32-29-5',
    [DESCRIPTION]: 'Special Vehicles Required to Stop at all Grade Crossing(M2)'
  },
  {
    [STATUTE]: '32-30-1',
    [DESCRIPTION]: 'Stopping, Parking on Roadway, Blocking Traffic(M2)'
  },
  {
    [STATUTE]: '32-30-11.3',
    [DESCRIPTION]: 'Parking/Non-Handicapped Person Parked in Marked Handicapped Space(M2)'
  },
  {
    [STATUTE]: '32-30-11.4',
    [DESCRIPTION]: 'Unauthorized Parking or Stopping in Designated Handicapped Space(M2)'
  },
  {
    [STATUTE]: '32-30-13',
    [DESCRIPTION]: 'Removal of Abandoned Vehicles'
  },
  {
    [STATUTE]: '32-30-2',
    [DESCRIPTION]: 'Manor of Parking by Roadway(M2)'
  },
  {
    [STATUTE]: '32-30-2.1',
    [DESCRIPTION]: 'Parking/Stopping on Two-Way Road(M2)'
  },
  {
    [STATUTE]: '32-30-2.2',
    [DESCRIPTION]: 'Position of Parking on One-Way Road(M2)'
  },
  {
    [STATUTE]: '32-30-2.3',
    [DESCRIPTION]: 'Parking/Stopping on State/Federal Highway'
  },
  {
    [STATUTE]: '32-30-2.4',
    [DESCRIPTION]: 'Parking In A No Parking Zone(M2)'
  },
  {
    [STATUTE]: '32-30-2.5',
    [DESCRIPTION]: 'Opening Door on Traffic Side of Vehicle'
  },
  {
    [STATUTE]: '32-30-20',
    [DESCRIPTION]: 'Unsafe Backing (M2)'
  },
  {
    [STATUTE]: '32-30-21',
    [DESCRIPTION]: 'Backing on Controlled-Access Highway Prohibited(M2)'
  },
  {
    [STATUTE]: '32-30-4',
    [DESCRIPTION]: 'Failure to Activate Emergency Lights on Disabled Vehicle(M2)'
  },
  {
    [STATUTE]: '32-30-5',
    [DESCRIPTION]: 'Safeguarding of Unattended Vehicle'
  },
  {
    [STATUTE]: '32-30-6',
    [DESCRIPTION]: 'Places Where Standing and Parking Prohibited (PO)'
  },
  {
    [STATUTE]: '32-30-6 (1)',
    [DESCRIPTION]: 'Standing or Parking Prohibited-In Front of a Public or Private Driveway (PO)'
  },
  {
    [STATUTE]: '32-30-6 (2)',
    [DESCRIPTION]: 'Standing or Parking Prohibited-Within 15 Feet of a Fire Hydrant (PO)'
  },
  {
    [STATUTE]: '32-30-6 (3)',
    [DESCRIPTION]: 'Standing or Parking Prohibited-Within 20 Feet of a Crosswalk at an Intersection (PO)'
  },
  {
    [STATUTE]: '32-30-6 (4)',
    [DESCRIPTION]: 'Standing or Parking Prohibited-Within 30 Feet of Any Flashing Signals, Stop Signs, Yield Signs or Traffic Control Signal (PO)'
  },
  {
    [STATUTE]: '32-30-6 (5)',
    [DESCRIPTION]: 'Standing or Parking Prohibited-Within 30 Feet of a Fire Station Entrance or Opposite Side of Street to Station Entrance Within 75 Feet (PO)'
  },
  {
    [STATUTE]: '32-30-6 (6)',
    [DESCRIPTION]: 'Standing or Parking Prohibited-At Any Place Where Official Signs Prohibit Standing (PO)'
  },
  {
    [STATUTE]: '32-30-6.1',
    [DESCRIPTION]: 'Stopping or Parking Prohibited-Beside Parked Car, Sidewalk,Crosswalk,Bridge,Railroad,Signs Prohibiting'
  },
  {
    [STATUTE]: '32-3-12',
    [DESCRIPTION]: 'Operation or Possession of Vehicle Without Certificate(M2)'
  },
  {
    [STATUTE]: '32-31-6',
    [DESCRIPTION]: 'Failure to Stop Upon Approach of Emergency Vehicle(M2)'
  },
  {
    [STATUTE]: '32-31-6.1',
    [DESCRIPTION]: 'Failure to Stop/Move Over Violation/Yield to Emergency Vehicle(M2)'
  },
  {
    [STATUTE]: '32-31-7',
    [DESCRIPTION]: 'Following Fire Truck(M2)'
  },
  {
    [STATUTE]: '32-31-8',
    [DESCRIPTION]: 'Driving Over Fire Hose(M2)'
  },
  {
    [STATUTE]: '32-32-4',
    [DESCRIPTION]: 'School Bus Yellow Prohibited'
  },
  {
    [STATUTE]: '32-32-6',
    [DESCRIPTION]: 'Unlawfully Passing School Bus With Flashing Lights(M2)'
  },
  {
    [STATUTE]: '32-3-27',
    [DESCRIPTION]: 'Fail To Transfer Title To MV(M2)'
  },
  {
    [STATUTE]: '32-3-3.1',
    [DESCRIPTION]: 'Fail To Register Mobile Home (M2)'
  },
  {
    [STATUTE]: '32-3-31',
    [DESCRIPTION]: 'Accept Transfer of Title with No Name(M2)'
  },
  {
    [STATUTE]: '32-33-13',
    [DESCRIPTION]: 'Failure to Stop For Road Block (M1)'
  },
  {
    [STATUTE]: '32-33-17',
    [DESCRIPTION]: 'Failure to Stop at State Weighing Station(M2)'
  },
  {
    [STATUTE]: '32-33-18',
    [DESCRIPTION]: 'Failure to Stop at Signal of Law Enforcement Officer (M2)'
  },
  {
    [STATUTE]: '32-33-19',
    [DESCRIPTION]: 'Fleeing From Law Enforcement (Repealed-Do Not Use)'
  },
  {
    [STATUTE]: '32-33-2',
    [DESCRIPTION]: 'Failure to Sign Citation (M2)'
  },
  {
    [STATUTE]: '32-34-23',
    [DESCRIPTION]: 'Fixing Vehicle w/Reportable Damage w/o Red Tag(M2)'
  },
  {
    [STATUTE]: '32-34-3',
    [DESCRIPTION]: 'Failure to Stop at Accident(M2)'
  },
  {
    [STATUTE]: '32-34-3.1',
    [DESCRIPTION]: 'Failure to Stop at Accident(M2)'
  },
  {
    [STATUTE]: '32-34-9',
    [DESCRIPTION]: 'Duty of Occupant of Vehicle to Give Notice Where Driver is Physically Incapable(M2)'
  },
  {
    [STATUTE]: '32-3-5',
    [DESCRIPTION]: 'Fraud-Sale without Delivering Certificate of Title(M2)'
  },
  {
    [STATUTE]: '32-35-109',
    [DESCRIPTION]: 'Giving Forged or Unauthorized Proof of Insurance(M1)'
  },
  {
    [STATUTE]: '32-35-110',
    [DESCRIPTION]: 'Driving After Suspension of License or Registration(M2)'
  },
  {
    [STATUTE]: '32-35-113',
    [DESCRIPTION]: 'No Proof of Insurance(M2)'
  },
  {
    [STATUTE]: '32-35-116',
    [DESCRIPTION]: 'Written Evidence of Financial Responsibility'
  },
  {
    [STATUTE]: '32-35-118',
    [DESCRIPTION]: 'No Proof of Insurance/Owner (When Another Person is Driver)(M2)'
  },
  {
    [STATUTE]: '32-3-7',
    [DESCRIPTION]: 'Failure to Deliver Title of Motor Vehicle (M2)'
  },
  {
    [STATUTE]: '32-37-1',
    [DESCRIPTION]: 'Seatbelts-No Child Restraint Seat Under Age 5'
  },
  {
    [STATUTE]: '32-37-1.1',
    [DESCRIPTION]: 'Seatbelts-Operator Responsible for Belts on Ages 5-18'
  },
  {
    [STATUTE]: '32-37-1.2',
    [DESCRIPTION]: 'Seatbelts- Drivers Ages 14-18 Required'
  },
  {
    [STATUTE]: '32-37-1.3',
    [DESCRIPTION]: 'Seatbelts-Passengers Ages 14-18 Required'
  },
  {
    [STATUTE]: '32-38-1',
    [DESCRIPTION]: 'Seatbelts-Fail to Use Seatbelts'
  },
  {
    [STATUTE]: '32-3A-1 (3)',
    [DESCRIPTION]: 'Boating-Traffic Piloting & Navigation(M2)'
  },
  {
    [STATUTE]: '32-3A-3',
    [DESCRIPTION]: 'Operating Boat Without License - Identifynig Numbers(M2)'
  },
  {
    [STATUTE]: '32-3A-5',
    [DESCRIPTION]: 'Improper Display of Boat Numbers(M2)'
  },
  {
    [STATUTE]: '32-5-101',
    [DESCRIPTION]: 'Driving while Registration Suspended or Revoked(M1)'
  },
  {
    [STATUTE]: '32-5-103',
    [DESCRIPTION]: 'Substitution/Alteration of License Plates(M1)'
  },
  {
    [STATUTE]: '32-5-16.3',
    [DESCRIPTION]: 'Permit Required to Move Mobile Home or Manufactured Home(M2)'
  },
  {
    [STATUTE]: '32-5-2',
    [DESCRIPTION]: 'Failure to Register Vehicle (M2)'
  },
  {
    [STATUTE]: '32-5-2.4',
    [DESCRIPTION]: 'Expired License Plates(M2)'
  },
  {
    [STATUTE]: '32-5-2.7',
    [DESCRIPTION]: 'Vehicle-Removal of Number Plates Upon Transfer or Assignment(M2)'
  },
  {
    [STATUTE]: '32-5-2.9',
    [DESCRIPTION]: 'Vehicle-Seller\'s Permit Required for Sold/Transferred Vehicle(M2)'
  },
  {
    [STATUTE]: '32-5-27',
    [DESCRIPTION]: 'Transfer of Title 30 Days (M2)'
  },
  {
    [STATUTE]: '32-5-4.1',
    [DESCRIPTION]: 'Nonresident registration application(M2)'
  },
  {
    [STATUTE]: '32-5-46',
    [DESCRIPTION]: 'No South Dakota License Plate(M2)'
  },
  {
    [STATUTE]: '32-5-6.3',
    [DESCRIPTION]: 'Schedule of Fees for Non-Commercial Vehicles(M2)'
  },
  {
    [STATUTE]: '32-5-76.1',
    [DESCRIPTION]: 'Portable Certificates for Persons with Substantial Disabilities - Failure to Surrender (M2)'
  },
  {
    [STATUTE]: '32-5-8.2',
    [DESCRIPTION]: 'Trailers or semitrailers with identification plates may only be pulled by certain motor vehicles--Violation as misdemeanor(M2)'
  },
  {
    [STATUTE]: '32-5-84.2',
    [DESCRIPTION]: 'Snowmobile License Plate Required'
  },
  {
    [STATUTE]: '32-5-86',
    [DESCRIPTION]: 'Reflectorized Plates-Car Licenses'
  },
  {
    [STATUTE]: '32-5-91',
    [DESCRIPTION]: 'Vehicle Registration Not in Possession'
  },
  {
    [STATUTE]: '32-5-98',
    [DESCRIPTION]: 'Conspicuous Display Plates or Number(M2)'
  },
  {
    [STATUTE]: '32-6B-22',
    [DESCRIPTION]: 'Use of 77 Dealer Plates(M1)'
  },
  {
    [STATUTE]: '32-6B-25',
    [DESCRIPTION]: 'Unauthorized Use of Dealer Sticker Demo Plates or In-Transit Permits(M2)'
  },
  {
    [STATUTE]: '32-6B-28',
    [DESCRIPTION]: 'Registration/Possession/Application Available(M2)'
  },
  {
    [STATUTE]: '32-6B-29',
    [DESCRIPTION]: 'Prohibitions on Use of Temporary Thirty-Day License Permits(M1)'
  },
  {
    [STATUTE]: '32-6B-4',
    [DESCRIPTION]: 'Sell Motor Vehicle w/o License(M2)'
  },
  {
    [STATUTE]: '32-9-14',
    [DESCRIPTION]: 'Overweight on Commercial Vehicle(M2)'
  },
  {
    [STATUTE]: '32-9-23.1',
    [DESCRIPTION]: 'Alternate commercial fee by intrastate carriers--Amount of fees--Proof of registration or temporary permit--Certificate required for commercial use of certain noncommercial vehicles(M2)'
  },
  {
    [STATUTE]: '32-9-23.3',
    [DESCRIPTION]: 'Permit Not Secured Prior to Movement-Ton Mile Permit(M2)'
  },
  {
    [STATUTE]: '32-9-3.1',
    [DESCRIPTION]: 'Operating a Vehicle Engaged in Harvest Operations with No Permit(M2)'
  },
  {
    [STATUTE]: '32-9-6',
    [DESCRIPTION]: 'Application to County Treasurer(M2)'
  },
  {
    [STATUTE]: '32-9-7',
    [DESCRIPTION]: 'No Commercial Plates(M2)'
  },
  {
    [STATUTE]: '32-9-8.1',
    [DESCRIPTION]: 'Identification Plates Required Semi-Trailer(M2)'
  },
  {
    [STATUTE]: '34-18-9',
    [DESCRIPTION]: 'Maintaining a Food Service Establishment Without a Valid License(M2)'
  },
  {
    [STATUTE]: '34-20A-55',
    [DESCRIPTION]: 'Protective Custody - Intoxication (M2'
  },
  {
    [STATUTE]: '34-23-1',
    [DESCRIPTION]: 'Exposure to Venereal Diseases (M2)'
  },
  {
    [STATUTE]: '34-35-16',
    [DESCRIPTION]: 'START OPEN FIRE IN BLACK HILLS(M2)'
  },
  {
    [STATUTE]: '34-35-8',
    [DESCRIPTION]: 'Throw Match or Burning Object From Vehicle (M2)'
  },
  {
    [STATUTE]: '34-35A-4',
    [DESCRIPTION]: 'Tampering With Alarm System(M2)'
  },
  {
    [STATUTE]: '34-37-11',
    [DESCRIPTION]: 'Fireworks - Sale/Use Prohibited In Forest/Park/Other (M2)'
  },
  {
    [STATUTE]: '34-37-16.1',
    [DESCRIPTION]: 'Unlawful Discharge Of Fireworks July 5 - June 27 (M2)'
  },
  {
    [STATUTE]: '34-37-4',
    [DESCRIPTION]: 'Explosives - Fireworks, Illegal possession/sale/use (M2)'
  },
  {
    [STATUTE]: '34-46-14',
    [DESCRIPTION]: 'Smoking in Public Place'
  },
  {
    [STATUTE]: '34-46-2',
    [DESCRIPTION]: 'Minor Purchasing or Possessing Tobacco(M2)'
  },
  {
    [STATUTE]: '34-46-2',
    [DESCRIPTION]: 'Selling Tobacco to Minor(M2)'
  },
  {
    [STATUTE]: '34-46-2',
    [DESCRIPTION]: 'Selling Tobacco to Minor, or Minor Purchasing or Possessing Tobacco(M2)'
  },
  {
    [STATUTE]: '34-46-5',
    [DESCRIPTION]: 'Minor Purchasing, Possessing or Consuming Tobacco(M2)'
  },
  {
    [STATUTE]: '34-46-5',
    [DESCRIPTION]: 'Sale or Distribution of Tobacco to Minor(M2)'
  },
  {
    [STATUTE]: '34A-7-6',
    [DESCRIPTION]: 'Littering (M2)'
  },
  {
    [STATUTE]: '34A-7-7',
    [DESCRIPTION]: 'Littering From Motor Vehicle or Into Lake or River (M2)'
  },
  {
    [STATUTE]: '34A-7-9',
    [DESCRIPTION]: 'Litter-Accumulation on Property Prohibited (M2)'
  },
  {
    [STATUTE]: '35-1-1',
    [DESCRIPTION]: 'Liquor Law Definitions(M2)'
  },
  {
    [STATUTE]: '35-1-4',
    [DESCRIPTION]: 'Traffic in Alcoholic Beverages Prohibited (M2)'
  },
  {
    [STATUTE]: '35-1-5.1',
    [DESCRIPTION]: 'Bottle Clubs Prohibited (M2)'
  },
  {
    [STATUTE]: '35-1-5.3',
    [DESCRIPTION]: 'Public Consumption of Alcoholic Beverage (M2)'
  },
  {
    [STATUTE]: '35-1-9.1',
    [DESCRIPTION]: 'Open Container/Motor Vehicle (M2)'
  },
  {
    [STATUTE]: '35-4-75',
    [DESCRIPTION]: 'On Sale Licensee Serve Alc Beverages Off Premises(M2)'
  },
  {
    [STATUTE]: '35-4-79',
    [DESCRIPTION]: 'Under 21 in Liquor Establishment (M2)'
  },
  {
    [STATUTE]: '35-4-81',
    [DESCRIPTION]: 'Sale of Alcoholic Beverages After Hours (M2)'
  },
  {
    [STATUTE]: '35-9-1',
    [DESCRIPTION]: 'Furnish Alcoholic Beverage to Person Under 18 (M1)'
  },
  {
    [STATUTE]: '35-9-1.1',
    [DESCRIPTION]: 'Furnishing Alcoholic Beverages to Persons 18 - 20 yrs old (M2)'
  },
  {
    [STATUTE]: '35-9-1.1',
    [DESCRIPTION]: 'Furnishing Alcoholic Beverages to Persons 18 - 20 yrs old (M2)'
  },
  {
    [STATUTE]: '35-9-10',
    [DESCRIPTION]: 'Social Host Prohibited / Alcohol by Person Age 18 - 20 (M2)'
  },
  {
    [STATUTE]: '35-9-2',
    [DESCRIPTION]: 'Underage Purchase/Possession/Consumption of Alcoholic Beverages (M2)'
  },
  {
    [STATUTE]: '36-11-13',
    [DESCRIPTION]: 'Unregistered Practice of Pharmacy(M2)'
  },
  {
    [STATUTE]: '36-11-15',
    [DESCRIPTION]: 'Illegal Dispensing of Prescription Drugs by Someone Other Than Pharmacist(M2)'
  },
  {
    [STATUTE]: '36-16-1',
    [DESCRIPTION]: 'License-Electrical Contracting w/o License(M2)'
  },
  {
    [STATUTE]: '36-25-17',
    [DESCRIPTION]: 'Plumbing w/o License or Registration(M2)'
  },
  {
    [STATUTE]: '37-11-1',
    [DESCRIPTION]: 'Business not Filed w/Register of Deeds (M2)'
  },
  {
    [STATUTE]: '37-13-3',
    [DESCRIPTION]: 'License-Peddling without License (Repealed - Do Not Use)'
  },
  {
    [STATUTE]: '37-17-1',
    [DESCRIPTION]: 'Sale After Remove/Alter Serial number - $400 or less(M2)'
  },
  {
    [STATUTE]: '37-24-6',
    [DESCRIPTION]: 'Fraud-Deceptive Acts or Practices(M2)'
  },
  {
    [STATUTE]: '38-22-13',
    [DESCRIPTION]: 'Moving agricultural machinery without cleaning as misdemeanor(M2)'
  },
  {
    [STATUTE]: '4.09.01',
    [DESCRIPTION]: 'County - Junk Nuisance (Hill City) (M2)'
  },
  {
    [STATUTE]: '40-34-13',
    [DESCRIPTION]: 'Ownership of Vicious Dog as Public Nuisance (M2)'
  },
  {
    [STATUTE]: '40-34-2',
    [DESCRIPTION]: 'Animals-Dog Disturbing Domestic Animals (M2)'
  },
  {
    [STATUTE]: '40-34-5',
    [DESCRIPTION]: 'Animals-Dog at Large (M2)'
  },
  {
    [STATUTE]: '41:03:02:01',
    [DESCRIPTION]: 'Operating Vehicles Off Roads Owned or Leased By SD Game, Fish & Parks(M2)'
  },
  {
    [STATUTE]: '41:04:01:09',
    [DESCRIPTION]: 'Boating - Operation in Posted Waters Prohibited (M2)'
  },
  {
    [STATUTE]: '41:04:05:02 (2)',
    [DESCRIPTION]: 'Boating - Life Preservers Required (M2)'
  },
  {
    [STATUTE]: '41:05:05:03',
    [DESCRIPTION]: 'Boating - Fire Extinguisher Required (M2)'
  },
  {
    [STATUTE]: '41:06:03:01',
    [DESCRIPTION]: 'Game Law - Improper Tagging of Game (M2)'
  },
  {
    [STATUTE]: '41:06:04:01',
    [DESCRIPTION]: 'Animal - Disturbing Wildlife Prohibited (M2)'
  },
  {
    [STATUTE]: '41-11-4',
    [DESCRIPTION]: 'Hunting Out Of Season - Game Birds (M2)'
  },
  {
    [STATUTE]: '41-12-6',
    [DESCRIPTION]: 'Fishing With Too Many Lines (M2)'
  },
  {
    [STATUTE]: '41-1-4',
    [DESCRIPTION]: 'Wanton Waste or Destruction of Protected Birds, Animals and Fish(M2)'
  },
  {
    [STATUTE]: '41-14-12',
    [DESCRIPTION]: 'Unlawful Selling of Big Game Animal'
  },
  {
    [STATUTE]: '41-14-2',
    [DESCRIPTION]: 'Possession of Protected Bird, Animal or Fish (M2)'
  },
  {
    [STATUTE]: '41-14-32',
    [DESCRIPTION]: 'Unlawful Possession of Bird, Animal or Fish (M2)'
  },
  {
    [STATUTE]: '41-17-1.1',
    [DESCRIPTION]: 'Obey Rules in State Parks - Park Permit (M2)'
  },
  {
    [STATUTE]: '41-17-25',
    [DESCRIPTION]: 'Campfire Open (Repealed - Do Not Use)'
  },
  {
    [STATUTE]: '41-17-27',
    [DESCRIPTION]: 'Driving on Black Hills Burlington Northern Heritage Trail (M2)'
  },
  {
    [STATUTE]: '41-1-8',
    [DESCRIPTION]: 'Interference w/Lawful Hunting, Trapping or Fishing Prohibited (M2)'
  },
  {
    [STATUTE]: '41-2-18',
    [DESCRIPTION]: 'Implementation of Game, Fish and Conservation Laws (M2)'
  },
  {
    [STATUTE]: '41-6-1',
    [DESCRIPTION]: 'Exempt Persons - Conditions/Rules (M2)'
  },
  {
    [STATUTE]: '41-6-13',
    [DESCRIPTION]: 'Hunting WO Parent Or Guardian If Not 16 (M2)'
  },
  {
    [STATUTE]: '41-6-16',
    [DESCRIPTION]: 'Game Law - Small Game Habitat Stamp, License or Permit Required (M2)'
  },
  {
    [STATUTE]: '41-6-19',
    [DESCRIPTION]: 'Hunting Big Game Without a LIcense(M1)'
  },
  {
    [STATUTE]: '41-6-19.1',
    [DESCRIPTION]: 'Hunting Elk in Violation of License(M1)'
  },
  {
    [STATUTE]: '41-6-21',
    [DESCRIPTION]: 'Limiting Number of Big Game Licenses (M2)'
  },
  {
    [STATUTE]: '41-6-33',
    [DESCRIPTION]: 'Taxidermist License - No License (M2)'
  },
  {
    [STATUTE]: '41-6-52',
    [DESCRIPTION]: 'Application for Resident License by Non-Resident Prohibited (M2)'
  },
  {
    [STATUTE]: '41-6-63',
    [DESCRIPTION]: 'Failure to Display Fishing License on Request (M2)'
  },
  {
    [STATUTE]: '41-6-71',
    [DESCRIPTION]: 'Lending Big Game License(M1)'
  },
  {
    [STATUTE]: '41-6-76',
    [DESCRIPTION]: 'Fishing without License - Resident (M2)'
  },
  {
    [STATUTE]: '41-6-77',
    [DESCRIPTION]: 'Fishing w/o License - Non Resident (M2)'
  },
  {
    [STATUTE]: '41-6-80',
    [DESCRIPTION]: 'No Hunting License for Predator or Varmints(M2)'
  },
  {
    [STATUTE]: '41-8-16',
    [DESCRIPTION]: 'Use of Salt to Attract Big Game Prohibited (M2)'
  },
  {
    [STATUTE]: '41-8-17',
    [DESCRIPTION]: 'Artificial Light & Night Vision Equipment in Hunting Prohibited (M2)'
  },
  {
    [STATUTE]: '41-8-17.1',
    [DESCRIPTION]: 'Spotlighting Prohibited - Times-Exceptions(M2)'
  },
  {
    [STATUTE]: '41-8-2',
    [DESCRIPTION]: 'Hunt or Possess Big Game Prohibited except as Provided (M2)'
  },
  {
    [STATUTE]: '41-8-32.1',
    [DESCRIPTION]: 'Mourning doves-Hunting within fifty yards of highway prohibited(M2)'
  },
  {
    [STATUTE]: '41-8-37',
    [DESCRIPTION]: 'Hunting from Motor Vehicle (M2)'
  },
  {
    [STATUTE]: '41-8-41',
    [DESCRIPTION]: 'Required Orange Clothing'
  },
  {
    [STATUTE]: '41-8-6',
    [DESCRIPTION]: 'Hunting Big Game w/o License (M2)'
  },
  {
    [STATUTE]: '41-9-1',
    [DESCRIPTION]: 'Fish/Hunt/Trap on Private Land w/o Owner Consent (M2)'
  },
  {
    [STATUTE]: '41-9-1.1',
    [DESCRIPTION]: 'Hunting w/in 660 Feet of Occupied Structure (M2)'
  },
  {
    [STATUTE]: '41-9-1.2',
    [DESCRIPTION]: 'Prohibited Big Game Hunt on Highway/Right Of Way (M2)'
  },
  {
    [STATUTE]: '41-9-2',
    [DESCRIPTION]: 'Hunting in Fire Protection District (M2)'
  },
  {
    [STATUTE]: '42-7A-48',
    [DESCRIPTION]: 'Video Lottery - Age Limit and Legal Hours(M2)'
  },
  {
    [STATUTE]: '42-8-102',
    [DESCRIPTION]: 'Personal Watercraft - Rules of Operation - Age Requirement (M2)'
  },
  {
    [STATUTE]: '42-8-103',
    [DESCRIPTION]: 'Violates Written Promise to Appear(M2)'
  },
  {
    [STATUTE]: '42-8-41',
    [DESCRIPTION]: 'Operation of Boat w/o Required Equipment (M2)'
  },
  {
    [STATUTE]: '42-8-46',
    [DESCRIPTION]: 'Boating-Reckless Operation(M1)'
  },
  {
    [STATUTE]: '42-8-48',
    [DESCRIPTION]: 'Prohibited Actions While Boating(M2)'
  },
  {
    [STATUTE]: '42-8-49',
    [DESCRIPTION]: 'Boating-Water Skiing Without Observor or Mirror(M2)'
  },
  {
    [STATUTE]: '42-8-58',
    [DESCRIPTION]: 'Boating-Failure to Report Boating Accident(M2)'
  },
  {
    [STATUTE]: '42-8-69',
    [DESCRIPTION]: 'Boating-Age Requirement for Driving Certain Motorboats(M2)'
  },
  {
    [STATUTE]: '43-23-10',
    [DESCRIPTION]: 'Opening or Injuring Fence or Gate (M2)'
  },
  {
    [STATUTE]: '44-9-13',
    [DESCRIPTION]: 'Misappropriation of Funds By Contractor (Under $100)(M2)'
  },
  {
    [STATUTE]: '45-6-77',
    [DESCRIPTION]: 'Exemption of Extraction of Sand, Gravel or Rock for Personal Use (M2)'
  },
  {
    [STATUTE]: '49-28-62',
    [DESCRIPTION]: 'Violating Motor Carrier Statutes and Regulations(M2)'
  },
  {
    [STATUTE]: '49-28-63',
    [DESCRIPTION]: 'UCR Violation'
  },
  {
    [STATUTE]: '49-28-66',
    [DESCRIPTION]: 'Fail to Allow Inspection of Commercial Vehicle (M2)'
  },
  {
    [STATUTE]: '49-28A-3',
    [DESCRIPTION]: 'Driver and/or Safety Requirements'
  },
  {
    [STATUTE]: '49-28A-3',
    [DESCRIPTION]: 'HazMat Violation (M2)'
  },
  {
    [STATUTE]: '49-28A-3',
    [DESCRIPTION]: 'Log Book'
  },
  {
    [STATUTE]: '49-28A-3',
    [DESCRIPTION]: 'Medical Card'
  },
  {
    [STATUTE]: '49-28A-3',
    [DESCRIPTION]: 'No Annual Inspection'
  },
  {
    [STATUTE]: '49-28A-3',
    [DESCRIPTION]: 'Out of Service Order Violation'
  },
  {
    [STATUTE]: '49-28A-3',
    [DESCRIPTION]: 'Placard Not Securely Affixed'
  },
  {
    [STATUTE]: '49-28A-3',
    [DESCRIPTION]: 'Vehicle Equipment Violation'
  },
  {
    [STATUTE]: '49-31-26',
    [DESCRIPTION]: 'Disclosure of message without written permission of sender or addressee (M2)'
  },
  {
    [STATUTE]: '49-34-16',
    [DESCRIPTION]: 'Unauthorized or Fraudulent Connection(M2)'
  },
  {
    [STATUTE]: '5.08.040',
    [DESCRIPTION]: 'City - Operation of Vehicles Engaged in Advertising(M2)'
  },
  {
    [STATUTE]: '5.12.020',
    [DESCRIPTION]: 'City - Licenses - Transaction of Business Authorized by Chapter License Required(M2)'
  },
  {
    [STATUTE]: '5.12.040',
    [DESCRIPTION]: 'City - Liquor - Selling Alcohol to Intoxicated Subject (Do Not Use)'
  },
  {
    [STATUTE]: '5.12.040 (I) (2)',
    [DESCRIPTION]: 'City - Serving Alcohol to Intoxicated Person (Do Not Use)'
  },
  {
    [STATUTE]: '5.12.060',
    [DESCRIPTION]: 'City - Liquor - Sale or Consumption After Hours(M2)'
  },
  {
    [STATUTE]: '5.12.080 (A)',
    [DESCRIPTION]: 'City - Consuming In Public(M2)'
  },
  {
    [STATUTE]: '5.12.080 (B)',
    [DESCRIPTION]: 'City - Liquor - Open Container in Public(M2)'
  },
  {
    [STATUTE]: '5.12.090',
    [DESCRIPTION]: 'City - Liquor - Minor in Possession (Do Not Use)'
  },
  {
    [STATUTE]: '5.12.120',
    [DESCRIPTION]: 'City - Open Container in Motor Vehicle (DO NOT USE)'
  },
  {
    [STATUTE]: '5.36.020',
    [DESCRIPTION]: 'City - License-No Pawn/Second Hand as Required(M2)'
  },
  {
    [STATUTE]: '5.36.080',
    [DESCRIPTION]: 'City - Recordkeeping Requirements  (Pawn)'
  },
  {
    [STATUTE]: '5.40.060',
    [DESCRIPTION]: 'City - Licenses - Selling without City Permit Fixed Premise (Repealed Do Not Use)'
  },
  {
    [STATUTE]: '5.48.010',
    [DESCRIPTION]: 'City - Peddling from Vehicles on Streets(M2)'
  },
  {
    [STATUTE]: '5.50.030',
    [DESCRIPTION]: 'City - Ice Cream Vendor License Required(M2)'
  },
  {
    [STATUTE]: '5.52.020',
    [DESCRIPTION]: 'City - Bouncer - No Security License(M2)'
  },
  {
    [STATUTE]: '5.60.040',
    [DESCRIPTION]: 'City - Operate taxicab without business license'
  },
  {
    [STATUTE]: '5.60.050',
    [DESCRIPTION]: 'City - Licensing-No Taxi Business(M2)'
  },
  {
    [STATUTE]: '5.60.090',
    [DESCRIPTION]: 'City - Taxi License Required(M2)'
  },
  {
    [STATUTE]: '5.60.100',
    [DESCRIPTION]: 'City - Taxi-Driver\'s License Required (M2)'
  },
  {
    [STATUTE]: '5.70.030',
    [DESCRIPTION]: 'City - License-Adult Oriented Business Required(M2)'
  },
  {
    [STATUTE]: '5.70.150',
    [DESCRIPTION]: 'City - Adult Oriented Business Violation-Sexual Act(M2)'
  },
  {
    [STATUTE]: '58-33-37',
    [DESCRIPTION]: 'Fraud-Insurance False Application of Loss (M2)'
  },
  {
    [STATUTE]: '58-33-5',
    [DESCRIPTION]: 'Fraud-Misrepresentation or False Adverstising of Policies(M2)'
  },
  {
    [STATUTE]: '58-4A-2',
    [DESCRIPTION]: 'Fraudulent Insurance Acts ($400 or Less)(M2)'
  },
  {
    [STATUTE]: '6.04.050',
    [DESCRIPTION]: 'City - Interfere with Enforcement of Animal Control Officer(M2)'
  },
  {
    [STATUTE]: '6.08.020',
    [DESCRIPTION]: 'City - Animals-Keeping Livestock or Fowl Near Dwelling(M2)'
  },
  {
    [STATUTE]: '6.08.030',
    [DESCRIPTION]: 'City - Animals-Livestock Running at Large Prohibited(M2)'
  },
  {
    [STATUTE]: '6.08.030',
    [DESCRIPTION]: 'City - Animals-Unclean Yard/Pen (Repealed-Do Not Use)'
  },
  {
    [STATUTE]: '6.08.050',
    [DESCRIPTION]: 'City - Animals-Kennels(M2)'
  },
  {
    [STATUTE]: '6.08.080',
    [DESCRIPTION]: 'City - Animals-Keeping a Wild Animal(M2)'
  },
  {
    [STATUTE]: '6.08.090',
    [DESCRIPTION]: 'City - Animals-Disturbing the Peace(M2)'
  },
  {
    [STATUTE]: '6.08.100',
    [DESCRIPTION]: 'City - Animals-Dangerous and Potentially Dangerous(M2)'
  },
  {
    [STATUTE]: '6.08.130',
    [DESCRIPTION]: 'City - Animals-Improper Care and Treatment(M2)'
  },
  {
    [STATUTE]: '6.08.140',
    [DESCRIPTION]: 'City - Maintenance of Places Where Animals are Kept(M2)'
  },
  {
    [STATUTE]: '6.08.150',
    [DESCRIPTION]: 'City - Animals-Inhumane Treatment(M2)'
  },
  {
    [STATUTE]: '6.08.160',
    [DESCRIPTION]: 'City - Animals-Tease, Molest, Bait or Bother(M2)'
  },
  {
    [STATUTE]: '6.08.170',
    [DESCRIPTION]: 'City - Animals Left in Vehicle(M2)'
  },
  {
    [STATUTE]: '6.08.180',
    [DESCRIPTION]: 'City - Animals-Strike with MV and not Stop or Report(M2)'
  },
  {
    [STATUTE]: '6.08.190 (B)',
    [DESCRIPTION]: 'City - Animal-Bite Not Reported by Owner(M2)'
  },
  {
    [STATUTE]: '6.08.190 (G)(1)',
    [DESCRIPTION]: 'City - Animals-Bite-Observation for Rabies(M2)'
  },
  {
    [STATUTE]: '6.08.200',
    [DESCRIPTION]: 'City - Animal Having Bitten a Person-Release Required Prior to Disposition(M2)'
  },
  {
    [STATUTE]: '6.08.240',
    [DESCRIPTION]: 'City - Animals Running at Large(M2)'
  },
  {
    [STATUTE]: '6.08.260',
    [DESCRIPTION]: 'City - Animals-Unlawful Deer Baiting(M2)'
  },
  {
    [STATUTE]: '6.08.270',
    [DESCRIPTION]: 'City - Pet Waste-On Public or Private Property(M2)'
  },
  {
    [STATUTE]: '6.12.010',
    [DESCRIPTION]: 'City - Animals - Dog or Cat Without City License(M2)'
  },
  {
    [STATUTE]: '6.12.020',
    [DESCRIPTION]: 'City - Animals-Dog Without Rabie Shot(M2)'
  },
  {
    [STATUTE]: '6.12.030',
    [DESCRIPTION]: 'City - Animals - Dog or Cat at Large(M2)'
  },
  {
    [STATUTE]: '6.12.040',
    [DESCRIPTION]: 'City - Animals-Confinement of Female Dog or Cat in Heat(M2)'
  },
  {
    [STATUTE]: '6.16.020',
    [DESCRIPTION]: 'City - Animal-Feeding of Wild Animals and Waterfowl(M2)'
  },
  {
    [STATUTE]: '60-11-15',
    [DESCRIPTION]: 'Failure To Pay Wages(M2)'
  },
  {
    [STATUTE]: '8.04.010',
    [DESCRIPTION]: 'City - Operating a Daycare Without a License(M2)'
  },
  {
    [STATUTE]: '8.08.090',
    [DESCRIPTION]: 'City - Unlawful Deposit (Do Not Use)'
  },
  {
    [STATUTE]: '8.08.100',
    [DESCRIPTION]: 'City - Unlawful Burning(M2)'
  },
  {
    [STATUTE]: '8.08.270',
    [DESCRIPTION]: 'City - Prohibited Wastes(M2)'
  },
  {
    [STATUTE]: '8.12.020',
    [DESCRIPTION]: 'City - Littering(M2)'
  },
  {
    [STATUTE]: '8.12.050',
    [DESCRIPTION]: 'City - Littering/Permitting Accumulation of Litter(M2)'
  },
  {
    [STATUTE]: '8.12.090',
    [DESCRIPTION]: 'City - Distribution of Handbills(M2)'
  },
  {
    [STATUTE]: '8.16.010',
    [DESCRIPTION]: 'City - Public Nuisance(M2)'
  },
  {
    [STATUTE]: '8.16.040',
    [DESCRIPTION]: 'City - Maintaining a Nuisance(M2)'
  },
  {
    [STATUTE]: '8.16.080',
    [DESCRIPTION]: 'City - Abandoned Property(M2)'
  },
  {
    [STATUTE]: '8.24.010',
    [DESCRIPTION]: 'City - General Fire Incident Other Than Arson(M2)'
  },
  {
    [STATUTE]: '8.24.020',
    [DESCRIPTION]: 'City - Possession/Manufacture/Sale of Fireworks(M2)'
  },
  {
    [STATUTE]: '8.28.020',
    [DESCRIPTION]: 'City - Weeds/Grass over 8 Inches(M2)'
  },
  {
    [STATUTE]: '8.32.040',
    [DESCRIPTION]: 'City - Swimming Unauthorized(M2)'
  },
  {
    [STATUTE]: '8.32.050',
    [DESCRIPTION]: 'City - Smoking in Building (Non-smoking)(M2)'
  },
  {
    [STATUTE]: '8.34.070',
    [DESCRIPTION]: 'City - Streets, Roads and Parking Area Reentrainment Prevention Requirements(M2)'
  },
  {
    [STATUTE]: '8.50.020',
    [DESCRIPTION]: 'City - Discharge of Pollutants into the Drainage System Prohibited(M2)'
  },
  {
    [STATUTE]: '84B',
    [DESCRIPTION]: 'County - Exhibition Driving (New Underwood) (M2)'
  },
  {
    [STATUTE]: '85-5',
    [DESCRIPTION]: 'County - Dogs/Cats Licenses (New Underwood) (M2)'
  },
  {
    [STATUTE]: '85-5-7B',
    [DESCRIPTION]: 'County - Animals-Dog at Large (New Underwood) (M2)'
  },
  {
    [STATUTE]: '85-8',
    [DESCRIPTION]: 'County - Liquor Open Container (New Underwood) (M2)'
  },
  {
    [STATUTE]: '86-6',
    [DESCRIPTION]: 'County - Curfew Nuisance (New Underwood) (M2)'
  },
  {
    [STATUTE]: '88-3',
    [DESCRIPTION]: 'County - Liquor Sale of Alcoholic Beverages (New Underwood) (M2)'
  },
  {
    [STATUTE]: '89-3',
    [DESCRIPTION]: 'County - Liquor-Alcohol Ordinance (New Underwood) (M2)'
  },
  {
    [STATUTE]: '9.04.010',
    [DESCRIPTION]: 'City - Fraud - Bad Checks(M2)'
  },
  {
    [STATUTE]: '9.04.040',
    [DESCRIPTION]: 'City - Policing/Impersonating a Police Officer(M2)'
  },
  {
    [STATUTE]: '9.04.050',
    [DESCRIPTION]: 'City - DC-Resisting or Obstructing Police Officer(M2)'
  },
  {
    [STATUTE]: '9.04.090',
    [DESCRIPTION]: 'County - Panhandling (Wall) (M2)'
  },
  {
    [STATUTE]: '9.04.090',
    [DESCRIPTION]: 'City - Loitering, Panhandling and/or Begging Prohibited (M2)'
  },
  {
    [STATUTE]: '9.08.010',
    [DESCRIPTION]: 'City - Simple Assault and Battery'
  },
  {
    [STATUTE]: '9.08.020',
    [DESCRIPTION]: 'City - Prohibition Against Certain Forms of Aggressive Solicitation(M2)'
  },
  {
    [STATUTE]: '9.08.030',
    [DESCRIPTION]: 'City - Disorderly Conduct(M2)'
  },
  {
    [STATUTE]: '9.08.040',
    [DESCRIPTION]: 'City - Disturbing the Peace(M2)'
  },
  {
    [STATUTE]: '9.08.050',
    [DESCRIPTION]: 'City - DC-Disorderly Assemblies(M2)'
  },
  {
    [STATUTE]: '9.08.060',
    [DESCRIPTION]: 'City - DC-Unlawful Assemblies(M2)'
  },
  {
    [STATUTE]: '9.08.070',
    [DESCRIPTION]: 'City - Indecent Exposure(M2)'
  },
  {
    [STATUTE]: '9.08.080',
    [DESCRIPTION]: 'City - Unlawful Use of Telephone(M2)'
  },
  {
    [STATUTE]: '9.12.020',
    [DESCRIPTION]: 'City - Vandalism-Damaging or Removing City Signs(M2'
  },
  {
    [STATUTE]: '9.12.030',
    [DESCRIPTION]: 'City - Interference With Barricades or Warning Devices(M2)'
  },
  {
    [STATUTE]: '9.12.040',
    [DESCRIPTION]: 'City - Polluting Rapid Creek or Other Water(M2)'
  },
  {
    [STATUTE]: '9.12.050',
    [DESCRIPTION]: 'City - Bottles, Cans and Containers Prohibited at Civic Center Events(M2)'
  },
  {
    [STATUTE]: '9.12.060',
    [DESCRIPTION]: 'City - Spitting on Streets, Sidewalks or Floors of Public Converyance or Building(M2)'
  },
  {
    [STATUTE]: '9.12.070',
    [DESCRIPTION]: 'City - Vandalism-Destruction of Private Property(M2)'
  },
  {
    [STATUTE]: '9.12.080',
    [DESCRIPTION]: 'City - Vandalism-Connecting, Disconnecting, or Tampering with Franchised Utility(M2)'
  },
  {
    [STATUTE]: '9.12.090',
    [DESCRIPTION]: 'City - Trespassing Upon or Damaging Parking(M2)'
  },
  {
    [STATUTE]: '9.12.120',
    [DESCRIPTION]: 'City - School Grounds-Prohibited Acts(M2)'
  },
  {
    [STATUTE]: '9.12.140',
    [DESCRIPTION]: 'City - Trespassing(M2)'
  },
  {
    [STATUTE]: '9.20.020',
    [DESCRIPTION]: 'City - Disseminating Obscene Materials(M2)'
  },
  {
    [STATUTE]: '9.20.040',
    [DESCRIPTION]: 'City - Pornography-Disseminating-Acts Constituting-Exhibiting to Show or Other Presentation in Public Place(M2)'
  },
  {
    [STATUTE]: '9.24.010',
    [DESCRIPTION]: 'City - Prostitution(M2)'
  },
  {
    [STATUTE]: '9.24.020',
    [DESCRIPTION]: 'City - Soliciting Prostitution(M2)'
  },
  {
    [STATUTE]: '9.24.030',
    [DESCRIPTION]: 'City - Keeping House of Prostitution(M2)'
  },
  {
    [STATUTE]: '9.28.010',
    [DESCRIPTION]: 'City - Weapons-Slingshots Prohibited(M2)'
  },
  {
    [STATUTE]: '9.28.020',
    [DESCRIPTION]: 'City - Throwing Stones & Missiles(M2)'
  },
  {
    [STATUTE]: '9.28.030',
    [DESCRIPTION]: 'City - Carrying Concealed Weapon(M2)'
  },
  {
    [STATUTE]: '9.28.040',
    [DESCRIPTION]: 'City - Possession of Weapon in a Liquor Establishment(M2)'
  },
  {
    [STATUTE]: '9.28.050',
    [DESCRIPTION]: 'City - Weapons-Discharging of a Firearm in City Limits(M2)'
  },
  {
    [STATUTE]: '90-2',
    [DESCRIPTION]: 'County - Weapon in Alcoholic Establishment (New Underwood) (M2)'
  },
  {
    [STATUTE]: '90-7',
    [DESCRIPTION]: 'County - Speed Limits (New Underwood) (M2)'
  },
  {
    [STATUTE]: '90-8',
    [DESCRIPTION]: 'County - Stop Sign (New Underwood)(M2)'
  },
  {
    [STATUTE]: '99-2-9',
    [DESCRIPTION]: 'Municipal Park Ordinances'
  }
];

export const PENN_BOOKING_RELEASE_EXCEPTIONS = [
  {
    [STATUTE]: '22-42-2',
    [DESCRIPTION]: 'Distribute/Manufacture of Controlled Drug(F4)'
  },
  {
    [STATUTE]: '22-42-2',
    [DESCRIPTION]: 'Distribute/Manufacture of Controlled Drug/Schedule I (F3)'
  },
  {
    [STATUTE]: '22-42-2',
    [DESCRIPTION]: 'Distribute/Manufacture of Controlled Drug/Schedule I to Minor (F2)'
  },
  {
    [STATUTE]: '22-42-2',
    [DESCRIPTION]: 'Distribute/Manufacture of Controlled Drug/Schedule II (F3)'
  },
  {
    [STATUTE]: '22-42-2',
    [DESCRIPTION]: 'Distribute/Manufacture of Controlled Drug/Schedule II to Minor (F2)'
  },
  {
    [STATUTE]: '22-42-2',
    [DESCRIPTION]: 'Distribute/Manufacture of Controlled Substance Schedule I (F4)'
  },
  {
    [STATUTE]: '22-42-2',
    [DESCRIPTION]: 'Distribute/Manufacture of Controlled Substance Schedule II (F4)'
  },
  {
    [STATUTE]: '22-42-3',
    [DESCRIPTION]: 'Possess, Distribute, or Manufacture Schedule II to a Minor(F3)'
  },
  {
    [STATUTE]: '22-42-3',
    [DESCRIPTION]: 'Possess, Distribute, or Manufacture Schedule III Drugs(F5)'
  },
  {
    [STATUTE]: '22-42-4',
    [DESCRIPTION]: 'Possess, Distribute, or Manufacture Schedule IV Drugs to a Minor (F4)'
  },
  {
    [STATUTE]: '22-42-4',
    [DESCRIPTION]: 'Possess, Distribute, or Manufacture Schedule IV Drugs(F5)'
  },
  {
    [STATUTE]: '22-42-7',
    [DESCRIPTION]: 'Possession w/Intent to Dist Marijuana Any Amount to Minor (F4)'
  },
  {
    [STATUTE]: '22-42-7',
    [DESCRIPTION]: 'Possession with Intent to Distribute 1 Lb or More Marijuana (F3)'
  },
  {
    [STATUTE]: '22-42-7',
    [DESCRIPTION]: 'Possession with Intent to Distribute 1/2 oz to 1oz (F6)'
  },
  {
    [STATUTE]: '22-42-2',
    [DESCRIPTION]: 'Possession with Intent to Distribute Controlled Substance Schedule 1(F4)'
  },
  {
    [STATUTE]: '22-42-2',
    [DESCRIPTION]: 'Possession with Intent to Distribute Controlled Substance Schedule II(F4)'
  },
  {
    [STATUTE]: '22-42-7',
    [DESCRIPTION]: 'Possession with Intent to Distribute Marijuana 1/2 lb to 1 lb (F4)'
  },
  {
    [STATUTE]: '22-42-7',
    [DESCRIPTION]: 'Possession with Intent to Distribute Marijuana 1oz but less than 1/2 lb (F5)'
  },
  {
    [STATUTE]: '22-14-5',
    [DESCRIPTION]: 'Possession of Firearm with Altered Serial Number(F6)'
  },
  {
    [STATUTE]: '37-17-1',
    [DESCRIPTION]: 'Sale After Remove/Alter Serial Number - $1000 or more(F4)'
  }
];
