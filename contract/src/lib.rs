use borsh::{BorshDeserialize, BorshSerialize};
use geohash::{encode, Coordinate};
use near_sdk::collections::Map;
use near_sdk::{env, near_bindgen, AccountId};
use serde::Serialize;

#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[derive(BorshDeserialize, BorshSerialize)]
pub struct POI {
    hash: String,
    address: String,
    category: u8,
    description: String,
}

#[derive(Default, Serialize)]
pub struct POIResponse {
    hash: String,
    address: String,
    category: u8,
    description: String,
}

impl POI {
    fn export(&self) -> POIResponse {
        let mut pt = POIResponse::default();
        pt.hash = self.hash.clone();
        pt.address = self.address.clone();
        pt.category = self.category as u8;
        pt.description = self.description.clone();
        return pt;
    }
}

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize)]
pub struct ProtestLive {
    boxes: Map<String, Map<String, POI>>,
}

impl Default for ProtestLive {
    fn default() -> Self {
        Self {
            boxes: Map::new(b"boxes".to_vec()),
        }
    }
}

#[near_bindgen]
impl ProtestLive {
    pub fn register_poi(
        &mut self,
        lng: f64,
        lat: f64,
        category: u8,
        address: String,
        description: String,
    ) {
        env::log(format!("registering poi {} {}", category as u8, address).as_bytes());
        let box_hash = match encode(Coordinate { x: lng, y: lat }, 5) {
            Ok(h) => h,
            Err(e) => {
                env::panic(
                    format!("err encoding coordinate(lng({}), lat({})): {}", lng, lat, e)
                        .as_bytes(),
                );
            }
        };
        let poi_hash = match encode(Coordinate { x: lng, y: lat }, 15) {
            Ok(h) => h,
            Err(e) => {
                env::panic(
                    format!("err encoding coordinate(lng({}), lat({})): {}", lng, lat, e)
                        .as_bytes(),
                );
            }
        };
        let pt = POI {
            hash: String::from(&poi_hash),
            address: String::from(address),
            category,
            description: String::from(description),
        };
        let mut geohash_box = match self.boxes.get(&box_hash) {
            Some(hash) => hash,
            None => Map::new(format!("box_{}", box_hash).as_bytes().to_vec()),
        };
        geohash_box.insert(&poi_hash, &pt);
        self.boxes.insert(&box_hash, &geohash_box);
    }
    pub fn query_pois(&self, box_hash: String) -> Vec<POIResponse> {
        env::log(format!("looking up box({}) pois", box_hash).as_bytes());
        let mut ret: Vec<POIResponse> = Vec::new();
        if let Some(pois) = self.boxes.get(&String::from(box_hash)) {
            for (_, p) in pois.iter() {
                let pr = p.export();
                ret.push(pr);
            }
        }
        ret
    }
    pub fn get_poi(&self, lng: f64, lat: f64) -> POIResponse {
        env::log(format!("looking up poi({}, {})", lng, lat).as_bytes());
        let box_hash = match encode(Coordinate { x: lng, y: lat }, 5) {
            Ok(h) => h,
            Err(e) => {
                env::panic(
                    format!("err encoding coordinate(lng({}), lat({})): {}", lng, lat, e)
                        .as_bytes(),
                );
            }
        };
        let poi_hash = match encode(Coordinate { x: lng, y: lat }, 15) {
            Ok(h) => h,
            Err(e) => {
                env::panic(
                    format!("err encoding coordinate(lng({}), lat({})): {}", lng, lat, e)
                        .as_bytes(),
                );
            }
        };
        if let Some(pois) = self.boxes.get(&String::from(box_hash)) {
            if let Some(p) = pois.get(&String::from(poi_hash)) {
                return p.export();
            }
        }
        POIResponse::default()
    }
    pub fn get_owner(&self) -> AccountId {
        env::current_account_id().clone()
    }
}

#[cfg(not(target_arch = "wasm32"))]
#[cfg(test)]
mod tests {
    use super::*;
    use near_sdk::{testing_env, AccountId, MockedBlockchain, VMContext};

    fn contract_owner() -> AccountId {
        "contract-owner.near".to_string()
    }

    fn get_context(account_id: AccountId) -> VMContext {
        VMContext {
            current_account_id: contract_owner(),
            signer_account_id: account_id.clone(),
            predecessor_account_id: account_id.clone(),
            signer_account_pk: vec![0, 1, 2],
            input: vec![],
            block_index: 0,
            block_timestamp: 0,
            account_balance: 0,
            account_locked_balance: 0,
            storage_usage: 10u64.pow(6),
            attached_deposit: 1_000,
            prepaid_gas: 10u64.pow(18),
            random_seed: vec![0, 1, 2],
            is_view: false,
            output_data_receivers: vec![],
            epoch_height: 0,
        }
    }

    #[test]
    fn register_n_query_pois() {
        let context = get_context(contract_owner());
        testing_env!(context);

        // register poi
        let mut contract = ProtestLive::default();
        contract.register_poi(
            12.1,
            21.2,
            0,
            String::from("10 Downing St"),
            String::from("Public waterpoint."),
        );
        for (id, b) in contract.boxes.iter() {
            assert_eq!(id, "s7b8e");
            for (_, p) in b.iter() {
                assert_eq!(p.hash, "s7b8e76fyqmvyn0");
                assert_eq!(p.category, 0);
                assert_eq!(p.address, "10 Downing St");
                assert_eq!(p.description, "Public waterpoint.");
            }
        }

        // try query empty box
        assert_eq!(contract.query_pois(String::from("s7b8f")).len(), 0);

        // query box contianing pois
        let query_result = contract.query_pois(String::from("s7b8e"));
        assert_eq!(query_result.len(), 1);
        let p = query_result.get(0).unwrap();
        assert_eq!(p.hash, "s7b8e76fyqmvyn0");
        assert_eq!(p.category, 0);
        assert_eq!(p.address, "10 Downing St");
        assert_eq!(p.description, "Public waterpoint.");

        // query box contianing pois
        let p2 = contract.get_poi(12.1, 21.2);
        assert_eq!(p2.hash, "s7b8e76fyqmvyn0");
        assert_eq!(p2.category, 0);
        assert_eq!(p2.address, "10 Downing St");
        assert_eq!(p2.description, "Public waterpoint.");
    }
}
