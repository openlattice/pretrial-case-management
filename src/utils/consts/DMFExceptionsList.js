import { CHARGE } from './Consts';

const {
  STATUTE,
  DESCRIPTION
} = CHARGE;

export const PENN_BOOKING_EXCEPTIONS = [
  {
    [STATUTE]: '32-12-72',
    [DESCRIPTION]: 'Allow Unauthorized Driver to Operate Vehicle(M2)'
  },
  {
    [STATUTE]: '32-21-3.1',
    [DESCRIPTION]: 'Annual Inspection of Large Passenger Vehicle Used by Nonprofit Organization(M2)'
  },
  {
    [STATUTE]: '32-20-13',
    [DESCRIPTION]: 'ATV Licensed as Motorcycle Prohibited on Interstate(M2)'
  },
  {
    [STATUTE]: '32-17-25',
    [DESCRIPTION]: 'Bicycle - No Lamps'
  },
  {
    [STATUTE]: '32-20B-3',
    [DESCRIPTION]: 'Bicycle-Fail to Yield Right-of-Way to Pedestrian (M2)'
  },
  {
    [STATUTE]: '32-20B-2',
    [DESCRIPTION]: 'Bicycle-Failure to Stop Before Entering Intersection or Crosswalk(M2)'
  },
  {
    [STATUTE]: '32-20B-5',
    [DESCRIPTION]: 'Bicycle-Operation on Roadway/Riding Close to Right-Hand Curb Required(M2)'
  },
  {
    [STATUTE]: '32-20B-4',
    [DESCRIPTION]: 'Bicycle-Parking on Sidewalk'
  },
  {
    [STATUTE]: '42-8-69',
    [DESCRIPTION]: 'Boating-Age Requirement for Driving Certain Motorboats(M2)'
  },
  {
    [STATUTE]: '42-8-46',
    [DESCRIPTION]: 'Boating-Reckless Operation(M1)'
  },
  {
    [STATUTE]: '32-3A-1 (3)',
    [DESCRIPTION]: 'Boating-Traffic Piloting & Navigation(M2)'
  },
  {
    [STATUTE]: '42-8-49',
    [DESCRIPTION]: 'Boating-Water Skiing Without Observor or Mirror(M2)'
  },
  {
    [STATUTE]: '6.08.180',
    [DESCRIPTION]: 'City - Animals-Strike with MV and not Stop or Report(M2)'
  },
  {
    [STATUTE]: '10.20.110',
    [DESCRIPTION]: 'City - Attached Objects that Drag, Swing or Protrude from Vehicle(M2)'
  },
  {
    [STATUTE]: '10.64.150',
    [DESCRIPTION]: 'City - Auto Related-Clinging to Motor Vehicle on Bicycle(M2)'
  },
  {
    [STATUTE]: '10.52.070',
    [DESCRIPTION]: 'City - Auto Related-Tampering with Motor Vehicle(M2)'
  },
  {
    [STATUTE]: '10.28.090 (B)',
    [DESCRIPTION]: 'City - Avoidance of Traffic Signal or Device(M2)'
  },
  {
    [STATUTE]: '10.64.170',
    [DESCRIPTION]: 'City - Bicycle -Lane Position(M2)'
  },
  {
    [STATUTE]: '10.64.210 (C)',
    [DESCRIPTION]: 'City - Bicycle -Operating on Sidewalk Downtown Prohibited(M2)'
  },
  {
    [STATUTE]: '10.64.210 (B)',
    [DESCRIPTION]: 'City - Bicycle -Yield to Pedestrians(M2)'
  },
  {
    [STATUTE]: '10.64.230',
    [DESCRIPTION]: 'City - Bicycle-Must Yield Before Emerging from Alley, Driveway or Building(M2)'
  },
  {
    [STATUTE]: '10.52.050',
    [DESCRIPTION]: 'City - Boarding or Alighting From Moving Vehicle(M2)'
  },
  {
    [STATUTE]: '10.12.290',
    [DESCRIPTION]: 'City - Breaking into a Funeral Procession(M2)'
  },
  {
    [STATUTE]: '12.24.090',
    [DESCRIPTION]: 'City - Canyon Lake - Operation of Motorboats(M2)'
  },
  {
    [STATUTE]: '10.12.340 (B)',
    [DESCRIPTION]: 'City - Careless Driving(M2)'
  },
  {
    [STATUTE]: '10.52.040',
    [DESCRIPTION]: 'City - Clinging to Motor Vehicle (Coaster, Sled, Skis, Roller Skates, any Toy) (M2)'
  },
  {
    [STATUTE]: '10.12.300',
    [DESCRIPTION]: 'City - Crossing Sidewalks'
  },
  {
    [STATUTE]: '10.20.060 (B)',
    [DESCRIPTION]: 'City - Dangling Objects from Mirror(M2)'
  },
  {
    [STATUTE]: '10.28.070',
    [DESCRIPTION]: 'City - Disobey Flashing Signals(M2)'
  },
  {
    [STATUTE]: '10.12.330',
    [DESCRIPTION]: 'City - Drag Racing on Private Property (M2)'
  },
  {
    [STATUTE]: '10.32.040',
    [DESCRIPTION]: 'City - Driving Off Truck Route(M2)'
  },
  {
    [STATUTE]: '12.24.050',
    [DESCRIPTION]: 'City - Driving on Bicycle and Pedestrial Trail System(M2)'
  },
  {
    [STATUTE]: '10.12.010',
    [DESCRIPTION]: 'City - Driving on Wrong Side of Road(M2)'
  },
  {
    [STATUTE]: '10.12.270',
    [DESCRIPTION]: 'City - Driving Over Fire Hose(M2)'
  },
  {
    [STATUTE]: '10.12.180',
    [DESCRIPTION]: 'City - Duty to Obey Red/Amber or Stop for a School Bus(M2)'
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
    [STATUTE]: '10.12.350',
    [DESCRIPTION]: 'City - Exhibition Driving(M2)'
  },
  {
    [STATUTE]: '10.20.050 (B)',
    [DESCRIPTION]: 'City - Fail to Dim Headlights(M2)'
  },
  {
    [STATUTE]: '10.28.090 (A)',
    [DESCRIPTION]: 'City - Fail to Obey Traffic Controll Device or Sign(M2)'
  },
  {
    [STATUTE]: '10.12.380',
    [DESCRIPTION]: 'City - Fail to Stop on Signal or Eluding a Police Vehicle(M1)'
  },
  {
    [STATUTE]: '10.12.100',
    [DESCRIPTION]: 'City - Fail to Yield Right-of-Way(M2)'
  },
  {
    [STATUTE]: '10.12.400',
    [DESCRIPTION]: 'City - Failure to Move Over/Vehicle Using Hazard Lights(M2)'
  },
  {
    [STATUTE]: '10.28.050',
    [DESCRIPTION]: 'City - Failure to Stay in Marked Lanes(M2)'
  },
  {
    [STATUTE]: '10.12.190',
    [DESCRIPTION]: 'City - Failure to Stop at RR Crossing(M2)'
  },
  {
    [STATUTE]: '10.12.170',
    [DESCRIPTION]: 'City - Failure to Stop For Emergency Vehicle(M2)'
  },
  {
    [STATUTE]: '10.12.150',
    [DESCRIPTION]: 'City - Failure to Stop from Alley, Driveway or Building(M2)'
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
    [STATUTE]: '10.12.160',
    [DESCRIPTION]: 'City - Failure to Yield to Emergency Vehicles(M2)'
  },
  {
    [STATUTE]: '10.36.030',
    [DESCRIPTION]: 'City - Failure to Yield to Person with Guide Dog or Cane(M2)'
  },
  {
    [STATUTE]: '10.20.100',
    [DESCRIPTION]: 'City - Flag or Light for Projecting Loads(M2)'
  },
  {
    [STATUTE]: '10.12.260',
    [DESCRIPTION]: 'City - Following Fire Apparatus or Driving or Stopping Near Scene of Fire(M2)'
  },
  {
    [STATUTE]: '10.12.250',
    [DESCRIPTION]: 'City - Following too Closely(M2)'
  },
  {
    [STATUTE]: '10.40.100',
    [DESCRIPTION]: 'City - Handicapped Parking Spaces-Unlawful Parking(M2)'
  },
  {
    [STATUTE]: '10.20.050 (A)',
    [DESCRIPTION]: 'City - Headlights/Taillights Required(M2)'
  },
  {
    [STATUTE]: '10.52.030',
    [DESCRIPTION]: 'City - Helmets Required When Riding Motorcycles - Under 18 Years of Age(M2)'
  },
  {
    [STATUTE]: '10.12.210',
    [DESCRIPTION]: 'City - Illegal Entry or Exit of Highway(M2)'
  },
  {
    [STATUTE]: '10.20.030 (B)',
    [DESCRIPTION]: 'City - Illegal Horns and Other Warning Devices(M1)'
  },
  {
    [STATUTE]: '10.20.020',
    [DESCRIPTION]: 'City - Illegal Muffler and Exhaust Systems(M2)'
  },
  {
    [STATUTE]: '10.12.090',
    [DESCRIPTION]: 'City - Illegal U-Turn(M2)'
  },
  {
    [STATUTE]: '10.12.320',
    [DESCRIPTION]: 'City - Impeding Traffic Flow (M2)'
  },
  {
    [STATUTE]: '10.12.070',
    [DESCRIPTION]: 'City - Improper Turn(M2)'
  },
  {
    [STATUTE]: '9.12.030',
    [DESCRIPTION]: 'City - Interference With Barricades or Warning Devices(M2)'
  },
  {
    [STATUTE]: '10.12.070 (2)',
    [DESCRIPTION]: 'City - Left Turn - Lane Position(M2)'
  },
  {
    [STATUTE]: '10.12.110',
    [DESCRIPTION]: 'City - Left Turn/Oncoming Traffic(M1)'
  },
  {
    [STATUTE]: '10.20.050 (A)',
    [DESCRIPTION]: 'City - Lights Time Usage(M2)'
  },
  {
    [STATUTE]: '10.50.270',
    [DESCRIPTION]: 'City - Minimum Off-Street Parking Requirements(M2)'
  },
  {
    [STATUTE]: '10.24.020',
    [DESCRIPTION]: 'City - Motor Vehicle Noise(M2)'
  },
  {
    [STATUTE]: '10.68.020 (A)',
    [DESCRIPTION]: 'City - No Snowmobile Registration(M2)'
  },
  {
    [STATUTE]: '10.20.060',
    [DESCRIPTION]: 'City - Obstructed View (M2)'
  },
  {
    [STATUTE]: '10.12.230',
    [DESCRIPTION]: 'City -- Obstructing Intersections or Crosswalks(M2)'
  },
  {
    [STATUTE]: '10.20.060 (A)',
    [DESCRIPTION]: 'City - Obstruction on Windshields and Side Windows(M2)'
  },
  {
    [STATUTE]: '10.20.070',
    [DESCRIPTION]: 'City - Operating Tracked Vehicle on Road (Use of lugs, ice spurs or log chains on wheels)(M2)'
  },
  {
    [STATUTE]: '5.08.040',
    [DESCRIPTION]: 'City - Operation of Vehicles Engaged in Advertising(M2)'
  },
  {
    [STATUTE]: '12.24.030',
    [DESCRIPTION]: 'City - Park Traffic Regulations(M2)'
  },
  {
    [STATUTE]: '10.40.040',
    [DESCRIPTION]: 'City - Parking-Parallel and Angle Parking(M1)'
  },
  {
    [STATUTE]: '10.12.040',
    [DESCRIPTION]: 'City - Passing on Right(M2)'
  },
  {
    [STATUTE]: '12.12.070',
    [DESCRIPTION]: 'City - Public Right-of-Ways - Work Impeding Use(M2)'
  },
  {
    [STATUTE]: '10.52.060',
    [DESCRIPTION]: 'City - Riding on Portion of Vehicle Not For Passenger(M2)'
  },
  {
    [STATUTE]: '10.12.070 (1)',
    [DESCRIPTION]: 'City - Right Turn - Lane Position(M2)'
  },
  {
    [STATUTE]: '10.12.060',
    [DESCRIPTION]: 'City - Signals Required when Starting, Stopping or Turning(M2)'
  },
  {
    [STATUTE]: '10.52.010',
    [DESCRIPTION]: 'City - Skateboarding - Prohibitions(M2)'
  },
  {
    [STATUTE]: '10.68.040 (E)',
    [DESCRIPTION]: 'City - Snowmobile Violations - Careless/Reckless Driving(M2)'
  },
  {
    [STATUTE]: '10.68.040 (A)',
    [DESCRIPTION]: 'City - Snowmobile Violations - Operation on Street(M2)'
  },
  {
    [STATUTE]: '10.68.040',
    [DESCRIPTION]: 'City - Snowmobile-Violations(M2)'
  },
  {
    [STATUTE]: '10.12.190 (B)',
    [DESCRIPTION]: 'City - Special Vehicles Fail to Stop at RR Crossing(M2)'
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
    [STATUTE]: '10.12.310 (B2)',
    [DESCRIPTION]: 'City - Speeding in a School Zone (11-15 MPH Over Limit)(M2)'
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
    [STATUTE]: '10.12.120 (B)',
    [DESCRIPTION]: 'City - Stop Sign Violation(M2)'
  },
  {
    [STATUTE]: '10.40.020',
    [DESCRIPTION]: 'City - Stopping/Standing/Parking on or in Prohibited Area(M2)'
  },
  {
    [STATUTE]: '5.60.100',
    [DESCRIPTION]: 'City - Taxi-Driver\'s License Required (M2)'
  },
  {
    [STATUTE]: '10.08.030',
    [DESCRIPTION]: 'City - Traffic Direction Compliance Required (LE, Fire or Crossing Guard)'
  },
  {
    [STATUTE]: '10.12.080',
    [DESCRIPTION]: 'City - Turning Restrictions(M2)'
  },
  {
    [STATUTE]: '10.12.360 (A)',
    [DESCRIPTION]: 'City - Unauthorized Operatioin of Vehicle on Private Property(M2)'
  },
  {
    [STATUTE]: '10.12.360',
    [DESCRIPTION]: 'City - Unauthorized Operation of Vehicles on Private and Public Property Prohibited(M2)'
  },
  {
    [STATUTE]: '10.44.150 (G)',
    [DESCRIPTION]: 'City - Unlawful Tampering with Immobilization Device (Boot)(M2)'
  },
  {
    [STATUTE]: '10.12.240',
    [DESCRIPTION]: 'City - Unsafe Backing(M2)'
  },
  {
    [STATUTE]: '10.20.090',
    [DESCRIPTION]: 'City - Unsecured Load(M2)'
  },
  {
    [STATUTE]: '10.20.120',
    [DESCRIPTION]: 'City - Use of Dynamic Brake Device Prohibited(M2)'
  },
  {
    [STATUTE]: '10.52.020',
    [DESCRIPTION]: 'City - Use of Skates or toy Vehicles on Roadways(M2)'
  },
  {
    [STATUTE]: '10.20.040',
    [DESCRIPTION]: 'City - Vehicle Unsafe/Brakes(M2)'
  },
  {
    [STATUTE]: '10.12.200',
    [DESCRIPTION]: 'City - Wrong Way on One-Way Streets and Alleys(M2)'
  },
  {
    [STATUTE]: '10.12.310 (A2)',
    [DESCRIPTION]: 'City- Speeding in a Construction Zone (1-5 MPH Over Limit)(M2)'
  },
  {
    [STATUTE]: '12.1.57',
    [DESCRIPTION]: 'County - Speeding - (Keystone) (M2)'
  },
  {
    [STATUTE]: '32-15-2.2',
    [DESCRIPTION]: 'Cracked or Broken Glass Prohibited(M2)'
  },
  {
    [STATUTE]: '32-12-38',
    [DESCRIPTION]: 'DL Restriction Violation'
  },
  {
    [STATUTE]: '32-35-110',
    [DESCRIPTION]: 'Driving After Suspension of License or Registration(M2)'
  },
  {
    [STATUTE]: '32-14-7',
    [DESCRIPTION]: 'Driving Off Truck Route'
  },
  {
    [STATUTE]: '32-31-8',
    [DESCRIPTION]: 'Driving Over Fire Hose(M2)'
  },
  {
    [STATUTE]: '32-12-65',
    [DESCRIPTION]: 'Driving Under Suspension (M2)'
  },
  {
    [STATUTE]: '32-5-101',
    [DESCRIPTION]: 'Driving while Registration Suspended or Revoked(M1)'
  },
  {
    [STATUTE]: '32-17-20',
    [DESCRIPTION]: 'Driving With Fog Lights On(M2)'
  },
  {
    [STATUTE]: '32-34-9',
    [DESCRIPTION]: 'Duty of Occupant of Vehicle to Give Notice Where Driver is Physically Incapable(M2)'
  },
  {
    [STATUTE]: '32-27-7',
    [DESCRIPTION]: 'Fail To Stop For Person With Seeing Eye Dog or Cane (M2)'
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
    [STATUTE]: '32-30-4',
    [DESCRIPTION]: 'Failure to Activate Emergency Lights on Disabled Vehicle(M2)'
  },
  {
    [STATUTE]: '32-5-2',
    [DESCRIPTION]: 'Failure to Register Vehicle (M2)'
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
    [STATUTE]: '32-28-4',
    [DESCRIPTION]: 'Failure To Stop At Red Light - Prohibited Right Turn on Red (M2)'
  },
  {
    [STATUTE]: '32-33-13',
    [DESCRIPTION]: 'Failure to Stop For Road Block (M1)'
  },
  {
    [STATUTE]: '32-34-23',
    [DESCRIPTION]: 'Fixing Vehicle w/Reportable Damage w/o Red Tag(M2)'
  },
  {
    [STATUTE]: '32-35-109',
    [DESCRIPTION]: 'Giving Forged or Unauthorized Proof of Insurance(M1)'
  },
  {
    [STATUTE]: '32-17-6',
    [DESCRIPTION]: 'Headlamps Improperly Adjusted(M2)'
  },
  {
    [STATUTE]: '32-17-24',
    [DESCRIPTION]: 'Headlamps Required on Motorcycle'
  },
  {
    [STATUTE]: '32-3A-5',
    [DESCRIPTION]: 'Improper Display of Boat Numbers(M2)'
  },
  {
    [STATUTE]: '32-15-28',
    [DESCRIPTION]: 'Improperly Adjusted Steering'
  },
  {
    [STATUTE]: '32-27-4',
    [DESCRIPTION]: 'Jaywalking-Duty to Yield Right-of-Way to Vehicles (PO)'
  },
  {
    [STATUTE]: '32-22-57',
    [DESCRIPTION]: 'Lift Axle Control Requirements--Permits(M2)'
  },
  {
    [STATUTE]: '32-12-41',
    [DESCRIPTION]: 'Lost or Destroyed License-Issuance of Duplicate'
  },
  {
    [STATUTE]: '32-25-1.1',
    [DESCRIPTION]: 'Maximum Daytime Speed(M2)'
  },
  {
    [STATUTE]: '32-25-15',
    [DESCRIPTION]: 'Maximum Speed at Obstructed View Intersection(M2)'
  },
  {
    [STATUTE]: '32-25-4',
    [DESCRIPTION]: 'Maximum Speeds on Interstate Highways(M2)'
  },
  {
    [STATUTE]: '32-22-21',
    [DESCRIPTION]: 'Maximum Weight Per Tire--Spacing of Axles--Violation as misdemeanor(M2)'
  },
  {
    [STATUTE]: '32-25-5',
    [DESCRIPTION]: 'Minimum Speed on Interstate - 40 MPH(M2)'
  },
  {
    [STATUTE]: '32-17-13',
    [DESCRIPTION]: 'Mounting of Relectors'
  },
  {
    [STATUTE]: '32-35-113',
    [DESCRIPTION]: 'No Proof of Insurance(M2)'
  },
  {
    [STATUTE]: '32-5-46',
    [DESCRIPTION]: 'No South Dakota License Plate(M2)'
  },
  {
    [STATUTE]: '32-15-2.1',
    [DESCRIPTION]: 'No Windshield/Laminated Windshield Required'
  },
  {
    [STATUTE]: '32-22-52',
    [DESCRIPTION]: 'Operate Overweight or Oversize Vehicle or Allow Operation(M2)'
  },
  {
    [STATUTE]: '32-20-6.1',
    [DESCRIPTION]: 'Operating Motorcycle With More Than 2 Passengers(M2)'
  },
  {
    [STATUTE]: '32-20-12',
    [DESCRIPTION]: 'Operating Offroad Vehicle/Operation on Certain Lands(M2)'
  },
  {
    [STATUTE]: '32-22-16.3',
    [DESCRIPTION]: 'Overweight Agricultural Vehicles(M2)'
  },
  {
    [STATUTE]: '32-22-42.2',
    [DESCRIPTION]: 'Overweight Harvest Vehicle(M2)'
  },
  {
    [STATUTE]: '32-9-14',
    [DESCRIPTION]: 'Overweight on Commercial Vehicle(M2)'
  },
  {
    [STATUTE]: '32-22-25',
    [DESCRIPTION]: 'Overweight Vehicle on Specified Road Weight Limits(M2)'
  },
  {
    [STATUTE]: '32-22-16',
    [DESCRIPTION]: 'Overweight Vehicles(M2)'
  },
  {
    [STATUTE]: '32-30-11.3',
    [DESCRIPTION]: 'Parking/Non-Handicapped Person Parked in Marked Handicapped Space(M2)'
  },
  {
    [STATUTE]: '32-30-2.3',
    [DESCRIPTION]: 'Parking/Stopping on State/Federal Highway'
  },
  {
    [STATUTE]: '32-30-2.1',
    [DESCRIPTION]: 'Parking/Stopping on Two-Way Road(M2)'
  },
  {
    [STATUTE]: '32-5-16.3',
    [DESCRIPTION]: 'Permit Required to Move Mobile Home or Manufactured Home(M2)'
  },
  {
    [STATUTE]: '32-12-73',
    [DESCRIPTION]: 'Permitting Unauthorized Minor to Use Vehicle (M2)'
  },
  {
    [STATUTE]: '32-30-6',
    [DESCRIPTION]: 'Places Where Standing and Parking Prohibited (PO)'
  },
  {
    [STATUTE]: '32-30-2.2',
    [DESCRIPTION]: 'Position of Parking on One-Way Road(M2)'
  },
  {
    [STATUTE]: '32-6B-29',
    [DESCRIPTION]: 'Prohibitions on Use of Temporary Thirty-Day License Permits(M1)'
  },
  {
    [STATUTE]: '32-22-24',
    [DESCRIPTION]: 'Reduced Load Maximums February 15 - April 13--Extension of Period--Changing Restrictions--Overweight Permits(M2)'
  },
  {
    [STATUTE]: '32-5-86',
    [DESCRIPTION]: 'Reflectorized Plates-Car Licenses'
  },
  {
    [STATUTE]: '32-30-13',
    [DESCRIPTION]: 'Removal of Abandoned Vehicles'
  },
  {
    [STATUTE]: '10-40-180',
    [DESCRIPTION]: 'Removal of vehicles parking in violation of title'
  },
  {
    [STATUTE]: '32-15-2',
    [DESCRIPTION]: 'Replacement With Material Other Than Safety Glass'
  },
  {
    [STATUTE]: '32-17-17',
    [DESCRIPTION]: 'Requirements of Auxillary Driving Lamps'
  },
  {
    [STATUTE]: '32-30-5',
    [DESCRIPTION]: 'Safeguarding of Unattended Vehicle'
  },
  {
    [STATUTE]: '32-5-6.3',
    [DESCRIPTION]: 'Schedule of Fees for Non-Commercial Vehicles(M2)'
  },
  {
    [STATUTE]: '32-32-4',
    [DESCRIPTION]: 'School Bus Yellow Prohibited'
  },
  {
    [STATUTE]: '32-20A-19',
    [DESCRIPTION]: 'Snowmobile Accident Not Reported(M2)'
  },
  {
    [STATUTE]: '32-5-84.2',
    [DESCRIPTION]: 'Snowmobile License Plate Required'
  },
  {
    [STATUTE]: '32-20A-3',
    [DESCRIPTION]: 'Snowmobile-Age Restriction on Driver(M2)'
  },
  {
    [STATUTE]: '32-20A-7',
    [DESCRIPTION]: 'Snowmobile-Conditions Permitting Operation on Roadways(M2)'
  },
  {
    [STATUTE]: '32-20A-10',
    [DESCRIPTION]: 'Snowmobile-Light Required when Dark(M2)'
  },
  {
    [STATUTE]: '32-20A-15',
    [DESCRIPTION]: 'Snowmobile-No Registration, License or Titling(M2)'
  },
  {
    [STATUTE]: '32-20A-5',
    [DESCRIPTION]: 'Snowmobile-Restriction of Use on Interstate HIghways and Railroads(M2)'
  },
  {
    [STATUTE]: '32-20A-11',
    [DESCRIPTION]: 'Snowmobile-Restriction on Carrying of Firearms(M2)'
  },
  {
    [STATUTE]: '32-20A-2',
    [DESCRIPTION]: 'Snowmobile-Speeding and Reckless/Muffler Required(M2)'
  },
  {
    [STATUTE]: '32-25-12',
    [DESCRIPTION]: 'Speed Limit in Unposted Urban Areas(M2)'
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
    [STATUTE]: '32-25-7',
    [DESCRIPTION]: 'Speeding Obey Speed Limits(M2)'
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
    [STATUTE]: '32-25-9.2',
    [DESCRIPTION]: 'Speeding Township Roads 55 MPH(M2)'
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
    [STATUTE]: '32-30-6 (6)',
    [DESCRIPTION]: 'Standing or Parking Prohibited-At Any Place Where Official Signs Prohibit Standing (PO)'
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
    [STATUTE]: '32-30-6 (5)',
    [DESCRIPTION]: 'Standing or Parking Prohibited-Within 30 Feet of a Fire Station Entrance or Opposite Side of Street to Station Entrance Within 75 Feet (PO)'
  },
  {
    [STATUTE]: '32-30-6 (4)',
    [DESCRIPTION]: 'Standing or Parking Prohibited-Within 30 Feet of Any Flashing Signals, Stop Signs, Yield Signs or Traffic Control Signal (PO)'
  },
  {
    [STATUTE]: '32-14-5',
    [DESCRIPTION]: 'Status Wrong Way on One Way Street(M2)'
  },
  {
    [STATUTE]: '10.12.410',
    [DESCRIPTION]: 'Texting or Certain Uses of Handheld Devices Prohibited While Driving'
  },
  {
    [STATUTE]: '32-26-47',
    [DESCRIPTION]: 'Texting or Certain Uses of Handheld Devices Prohibited While Driving'
  },
  {
    [STATUTE]: '32-26-7',
    [DESCRIPTION]: 'Three-Lane Highways--Overtaking and Passing'
  },
  {
    [STATUTE]: '32-30-11.4',
    [DESCRIPTION]: 'Unauthorized Parking or Stopping in Designated Handicapped Space(M2)'
  },
  {
    [STATUTE]: '31-15-94',
    [DESCRIPTION]: 'Unlawful Use of Median (DO NOT USE)'
  },
  {
    [STATUTE]: '32-25-5.1',
    [DESCRIPTION]: 'Unreasonably Slow Speed Prohibited(M2)'
  },
  {
    [STATUTE]: '32-22-57.1',
    [DESCRIPTION]: 'Vehicle Equipped with Variable Load Axle to be Equipped with Pressure Control Device(M2)'
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
    [STATUTE]: '32-28-6',
    [DESCRIPTION]: 'Violation of Flashing Red or Yellow Signal(M2)'
  },
  {
    [STATUTE]: '32-12-11',
    [DESCRIPTION]: 'Violation of Learner\'s Permit by person at least fourteen but less than eighteen(M2)'
  },
  {
    [STATUTE]: '32-35-116',
    [DESCRIPTION]: 'Written Evidence of Financial Responsibility'
  },
  {
    [STATUTE]: '32-24-8',
    [DESCRIPTION]: 'Careless Driving (M2)'
  },
  {
    [STATUTE]: '10.12.340 (B)',
    [DESCRIPTION]: 'City - Careless Driving(M2)'
  },
  {
    [STATUTE]: '5.12.080 (B)',
    [DESCRIPTION]: 'City - Liquor - Open Container in Public(M2)'
  },
  {
    [STATUTE]: '5.12.120',
    [DESCRIPTION]: 'City - Open Container in Motor Vehicle (DO NOT USE)'
  },
  {
    [STATUTE]: '10.68.040 (E)',
    [DESCRIPTION]: 'City - Snowmobile Violations - Careless/Reckless Driving(M2)'
  },
  {
    [STATUTE]: '9.12.140',
    [DESCRIPTION]: 'City - Trespassing(M2)'
  },
  {
    [STATUTE]: '12.24.010',
    [DESCRIPTION]: 'City - Trespassing-Park Closed (M2)'
  },
  {
    [STATUTE]: '32-5-98',
    [DESCRIPTION]: 'Conspicuous Display Plates or Number(M2)'
  },
  {
    [STATUTE]: '85-8',
    [DESCRIPTION]: 'County - Liquor Open Container (New Underwood) (M2)'
  },
  {
    "statute": 10.4,
    [DESCRIPTION]: 'County - Open Container (Hill City) (M)'
  },
  {
    "statute": 1163.25,
    [DESCRIPTION]: 'County - Reckless Careless and Exhibition Driving (Box Elder) (M2)'
  },
  {
    [STATUTE]: '32-35-110',
    [DESCRIPTION]: 'Driving After Suspension of License or Registration(M2)'
  },
  {
    [STATUTE]: '32-12-65 (2)',
    [DESCRIPTION]: 'Driving Under Suspension (M2)'
  },
  {
    [STATUTE]: '32-12-65',
    [DESCRIPTION]: 'Driving Under Suspension (M2)'
  },
  {
    [STATUTE]: '32-12-65',
    [DESCRIPTION]: 'Driving Under Suspension (M2)'
  },
  {
    [STATUTE]: '32-23-1',
    [DESCRIPTION]: 'DUI 1st Offense (M1)'
  },
  {
    [STATUTE]: '22-35-5',
    [DESCRIPTION]: 'Enter or Remain in Building - Unlawful Occupancy (M1)'
  },
  {
    [STATUTE]: '32-5-2.4',
    [DESCRIPTION]: 'Expired License Plates(M2)'
  },
  {
    [STATUTE]: '32-5-2',
    [DESCRIPTION]: 'Failure to Register Vehicle (M2)'
  },
  {
    [STATUTE]: '22-35-6',
    [DESCRIPTION]: 'Failure to Vacate/Ordered to Leave (M1)'
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
    [STATUTE]: '32-35-113',
    [DESCRIPTION]: 'No Proof of Insurance(M2)'
  },
  {
    [STATUTE]: '32-35-118',
    [DESCRIPTION]: 'No Proof of Insurance/Owner (When Another Person is Driver)(M2)'
  },
  {
    [STATUTE]: '35-1-9.1',
    [DESCRIPTION]: 'Open Container/Motor Vehicle (M2)'
  },
  {
    [STATUTE]: '32-3-12',
    [DESCRIPTION]: 'Operation or Possession of Vehicle Without Certificate(M2)'
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
    [STATUTE]: '35-1-5.3',
    [DESCRIPTION]: 'Public Consumption of Alcoholic Beverage (M2)'
  },
  {
    [STATUTE]: '32-5-103',
    [DESCRIPTION]: 'Substitution/Alteration of License Plates(M1)'
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
    [STATUTE]: '22-35-6',
    [DESCRIPTION]: 'Trespassing on Premises (M1)'
  },
  {
    [STATUTE]: '22-35-6',
    [DESCRIPTION]: 'Trespassing on Premises (M2)'
  },
  {
    [STATUTE]: '35-9-2',
    [DESCRIPTION]: 'Underage Purchase/Possession/Consumption of Alcoholic Beverages (M2)'
  }
];
