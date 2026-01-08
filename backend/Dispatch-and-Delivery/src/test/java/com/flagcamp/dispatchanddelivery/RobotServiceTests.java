// package com.flagcamp.dispatchanddelivery;

// import com.flagcamp.dispatchanddelivery.entity.HubEntity;
// import com.flagcamp.dispatchanddelivery.entity.RobotEntity;
// import com.flagcamp.dispatchanddelivery.repository.HubRepository;
// import com.flagcamp.dispatchanddelivery.repository.RobotRepository;
// import com.flagcamp.dispatchanddelivery.service.RobotService;
// import org.junit.jupiter.api.Assertions;
// import org.junit.jupiter.api.BeforeEach;
// import org.junit.jupiter.api.Test;
// import org.junit.jupiter.api.extension.ExtendWith;
// import org.mockito.Mock;
// import org.mockito.Mockito;
// import org.mockito.junit.jupiter.MockitoExtension;

// import java.util.List;

// @ExtendWith(MockitoExtension.class)
// public class RobotServiceTests {

//     @Mock
//     private HubRepository hubRepository;

//     @Mock
//     private RobotRepository robotRepository;

//     private RobotService robotService;

//     @BeforeEach
//     void setup() {
//         robotService = new RobotService(hubRepository, robotRepository);
//     }

//     // ===================== Hub CRUD Tests =====================
//     @Test
//     void addHub_shouldCallRepositorySave() {
//         HubEntity hub = new HubEntity(null, 10.0, 20.0, "Address");
//         Mockito.when(hubRepository.save(hub)).thenReturn(new HubEntity(1L, 10.0, 20.0, "Address"));

//         HubEntity saved = robotService.addHub(10.0, 20.0, "Address");

//         Assertions.assertEquals(1L, saved.hub_id());
//         Assertions.assertEquals(10.0, saved.lat());
//         Mockito.verify(hubRepository).save(hub);
//     }

//     @Test
//     void getAllHubs_shouldReturnHubList() {
//         List<HubEntity> hubs = List.of(
//                 new HubEntity(1L, 10.0, 20.0, "A"),
//                 new HubEntity(2L, 11.0, 21.0, "B")
//         );
//         Mockito.when(hubRepository.findAll()).thenReturn(hubs);

//         List<HubEntity> result = robotService.getAllHubs();

//         Assertions.assertEquals(2, result.size());
//     }

//     @Test
//     void findNearestHub_shouldReturnClosestHub() {
//         HubEntity hub1 = new HubEntity(1L, 10.0, 10.0, "A");
//         HubEntity hub2 = new HubEntity(2L, 20.0, 20.0, "B");
//         Mockito.when(hubRepository.findAll()).thenReturn(List.of(hub1, hub2));

//         HubEntity nearest = robotService.findNearestHub(11.0, 11.0).orElseThrow();

//         Assertions.assertEquals(1L, nearest.hub_id());
//     }

//     // ===================== Robot CRUD Tests =====================
//     @Test
//     void addRobot_shouldCallRepositorySave() {
//         RobotEntity robot = new RobotEntity(null, true, 100, 1L, 10.0, 20.0, 50.0, 5, 10.0, "robot");
//         RobotEntity savedRobot = new RobotEntity(1L, true, 100, 1L, 10.0, 20.0, 50.0, 5, 10.0, "robot");

//         Mockito.when(robotRepository.save(robot)).thenReturn(savedRobot);

//         RobotEntity result = robotService.addRobot(true, 100, 1L, 10.0, 20.0, 50.0, 5, 10.0, "robot");

//         Assertions.assertEquals(1L, result.robot_id());
//         Mockito.verify(robotRepository).save(robot);
//     }

//     @Test
//     void getAllRobots_shouldReturnRobotList() {
//         List<RobotEntity> robots = List.of(
//                 new RobotEntity(1L, true, 100, 1L, 10.0, 20.0, 50.0, 5, 10.0, "robot"),
//                 new RobotEntity(2L, true, 90, 1L, 11.0, 21.0, 60.0, 6, 15.0, "drone")
//         );
//         Mockito.when(robotRepository.findAll()).thenReturn(robots);

//         List<RobotEntity> result = robotService.getAllRobots();

//         Assertions.assertEquals(2, result.size());
//     }

//     // ===================== Recommended Robot Tests =====================
//     @Test
//     void findCheapestRobot_shouldReturnRobotWithLowestPrice() {
//         RobotEntity r1 = new RobotEntity(1L, true, 100, 1L, 0,0,50,5,10,"robot");
//         RobotEntity r2 = new RobotEntity(2L, true, 100, 1L, 0,0,50,5,5,"robot");

//         Mockito.when(robotRepository.findAvailableByHubIdAndType(1L, "robot")).thenReturn(List.of(r1, r2));

//         RobotEntity cheapest = robotService.findCheapestRobot(1L).orElseThrow();

//         Assertions.assertEquals(2L, cheapest.robot_id());
//     }

//     @Test
//     void findFastestDrone_shouldReturnDroneWithMaxSpeed() {
//         RobotEntity d1 = new RobotEntity(1L, true, 100, 1L, 0,0,50,5,10,"drone");
//         RobotEntity d2 = new RobotEntity(2L, true, 100, 1L, 0,0,50,10,15,"drone");

//         Mockito.when(robotRepository.findAvailableByHubIdAndType(1L, "drone")).thenReturn(List.of(d1, d2));

//         RobotEntity fastest = robotService.findFastestDrone(1L).orElseThrow();

//         Assertions.assertEquals(2L, fastest.robot_id());
//     }
// }